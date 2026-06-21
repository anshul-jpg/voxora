import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { calculateCallBilling, calculateMaxDurationSeconds } from "@/lib/billing";

const generateTrackingCode = (prefix = "APX-", length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    let isAuthorizedVapi = false;

    // 1. Authorize Vapi webhook request using secret header
    if (webhookSecret) {
      const authHeader = request.headers.get("x-vapi-secret");
      if (authHeader === webhookSecret) {
        isAuthorizedVapi = true;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Apply rate limiting ONLY to unauthenticated requests (e.g. public curl testing / abuse)
    if (!isAuthorizedVapi) {
      const limiter = rateLimit(request, { limit: 20, windowMs: 60 * 1000 });
      if (!limiter.success) {
        return NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "Retry-After": String(limiter.reset),
            },
          }
        );
      }
    }

    const payload = await request.json();
    const eventType = payload.message?.type;
    console.log("🚀 Incoming Webhook Event Type:", eventType);

    // Route webhook events
    if (eventType === "assistant-request") {
      return await handleAssistantRequest(payload);
    }

    if (eventType === "end-of-call-report") {
      return await handleEndOfCall(payload);
    }

    if (eventType === "tool-calls") {
      return await handleToolCalls(payload);
    }

    return NextResponse.json({ status: "ignored_event" }, { status: 200 });

  } catch (error) {
    console.error("💥 Execution Error:", error);
    return NextResponse.json({
      results: [
        {
          name: "error_handler",
          toolCallId: "error",
          result: "An internal system delay occurred. Please try again."
        }
      ]
    }, { status: 200 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// assistant-request: Before call starts, perform balance checks & duration caps
// ─────────────────────────────────────────────────────────────────────────────
async function handleAssistantRequest(payload: any) {
  const orgId = payload.message.call?.metadata?.orgId;
  const callId = payload.message.call?.id;

  if (!orgId || !callId) {
    console.error("❌ Missing orgId or callId in assistant-request:", { orgId, callId });
    return NextResponse.json({ error: "Missing metadata parameters" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const [org, sub] = await Promise.all([
    db.collection("organizations").findOne({ _id: new ObjectId(orgId) }),
    db.collection("subscriptions").findOne({ orgId: new ObjectId(orgId) }),
  ]);

  if (!org || !sub) {
    return voicemailFallback();
  }

  // Suspended or canceled accounts get routed straight to voicemail
  if (sub.subscriptionStatus === "canceled" || sub.subscriptionStatus === "inactive") {
    return voicemailFallback();
  }

  // Calculate dynamic maximum call duration allowed based on remaining plan and wallet resources
  const maxDurationSeconds = calculateMaxDurationSeconds({
    baseMinutesAllocated: sub.baseMinutesAllocated || 0,
    baseMinutesUsed: sub.baseMinutesUsed || 0,
    walletBalanceUSD: sub.walletBalanceUSD || 0,
    pendingReservedUSD: sub.pendingReservedUSD || 0,
    subscriptionTier: sub.subscriptionTier,
  });

  if (maxDurationSeconds <= 0) {
    return voicemailFallback();
  }

  // 🔒 Lock reservations to protect against concurrent call overspend
  const reservedMinutes = Math.ceil(maxDurationSeconds / 60);
  const baseMinutesRemaining = Math.max(0, (sub.baseMinutesAllocated || 0) - (sub.baseMinutesUsed || 0));
  const reservedWalletMinutes = Math.max(0, reservedMinutes - baseMinutesRemaining);
  const overageRate = sub.subscriptionTier === "professional" ? 0.35 : 0.45;
  const reservedUSD = reservedWalletMinutes * overageRate;

  // Record call reservation state to prevent amnesia/duplicate leaks
  await db.collection("calls").insertOne({
    callId,
    orgId: new ObjectId(orgId),
    processed: false,
    reservedMinutes,
    reservedUSD,
    createdAt: new Date(),
  });

  await db.collection("subscriptions").updateOne(
    { _id: sub._id },
    {
      $inc: {
        currentActiveCalls: 1,
        pendingReservedMinutes: reservedMinutes,
        pendingReservedUSD: reservedUSD,
      },
      $set: { updatedAt: new Date() },
    }
  );

  return NextResponse.json({
    assistantId: org.vapiAssistantId,
    assistantOverrides: {
      maxDurationSeconds,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// end-of-call-report: Deduct minutes/wallet and release reservation locks
// ─────────────────────────────────────────────────────────────────────────────
async function handleEndOfCall(payload: any) {
  const call = payload.message.call;
  const orgId = call?.metadata?.orgId;
  const callId = call?.id;

  if (!orgId || !callId) {
    return NextResponse.json({ error: "Missing orgId or callId" }, { status: 400 });
  }

  const durationSeconds = Number(call.duration || 0);
  const providerRawCostUSD = Number(call.cost || 0);

  const client = await clientPromise;
  const db = client.db();

  // Find the call reservation document
  const callDoc = await db.collection("calls").findOne({ callId });

  // 🔒 Idempotency Check: if call was already processed, ignore
  if (callDoc && callDoc.processed) {
    return NextResponse.json({ status: "already_processed" });
  }

  const sub = await db.collection("subscriptions").findOne({
    orgId: new ObjectId(orgId),
  });

  if (!sub) {
    return NextResponse.json({ error: "Subscription missing" }, { status: 400 });
  }

  // Deduct actual billing
  const billing = calculateCallBilling({
    durationSeconds,
    baseMinutesAllocated: sub.baseMinutesAllocated || 0,
    baseMinutesUsed: sub.baseMinutesUsed || 0,
    walletBalanceUSD: sub.walletBalanceUSD || 0.0,
    subscriptionTier: sub.subscriptionTier,
  });

  // Read exact reserved values to release lock cleanly
  const releaseMinutes = callDoc ? (callDoc.reservedMinutes || 0) : 0;
  const releaseUSD = callDoc ? (callDoc.reservedUSD || 0) : 0;

  // Atomic database deductions
  await db.collection("subscriptions").updateOne(
    { _id: sub._id },
    {
      $inc: {
        baseMinutesUsed: billing.baseMinutesToUse,
        walletBalanceUSD: -billing.walletCost,
        currentActiveCalls: -1,
        pendingReservedMinutes: -releaseMinutes,
        pendingReservedUSD: -releaseUSD,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );

  // Update or insert call details, marking as processed
  await db.collection("calls").updateOne(
    { callId },
    {
      $set: {
        orgId: new ObjectId(orgId),
        durationSeconds,
        durationMinutes: billing.durationMinutes,
        billedToBasePlanMinutes: billing.baseMinutesToUse,
        billedToPrepaidWalletUSD: billing.walletCost,
        providerRawCostUSD,
        customerPhone: call.customer?.number || null,
        recordingUrl: call.recordingUrl || null,
        transcript: call.transcript || null,
        summary: call.summary || null,
        terminationReason: call.endedReason || null,
        promptVersion: call.assistant?.model?.semanticVersion || "v1.0.0",
        processed: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Write billing audit event
  await db.collection("billing_events").insertOne({
    orgId: new ObjectId(orgId),
    type: "usage_deduction",
    amountUSD: billing.walletCost,
    minutes: billing.durationMinutes,
    vapiCallId: callId,
    metadata: { durationSeconds },
    createdAt: new Date(),
  });

  // Check if user entered overdraft or fallback limit
  const finalWallet = sub.walletBalanceUSD - billing.walletCost;
  if (finalWallet <= -15.0) {
    await db.collection("billing_events").insertOne({
      orgId: new ObjectId(orgId),
      type: "voicemail_fallback_enabled",
      metadata: { walletBalance: finalWallet },
      createdAt: new Date(),
    });
  } else if (finalWallet < 0) {
    await db.collection("billing_events").insertOne({
      orgId: new ObjectId(orgId),
      type: "overdraft_started",
      metadata: { walletBalance: finalWallet },
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ status: "processed" });
}

// ─────────────────────────────────────────────────────────────────────────────
// tool-calls: Appointment bookings & schedules (Preserved landing page logic)
// ─────────────────────────────────────────────────────────────────────────────
async function handleToolCalls(payload: any) {
  const toolCall = payload.message.toolCallList?.[0] || payload.message.toolCall;
  if (!toolCall) {
    return NextResponse.json({ error: "No active tool payload found" }, { status: 400 });
  }

  const functionName = toolCall.function?.name || toolCall.name;
  const toolCallId = toolCall.id;
  const args = toolCall.function?.arguments || toolCall.parameters || toolCall.arguments || {};

  console.log("🔍 EXACT FUNCTION NAME RESOLVED:", `"${functionName}"`);
  console.log("📦 ARGUMENTS RECEIVED:", args);

  if (!functionName) {
    return NextResponse.json({ error: "Function name could not be resolved" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(); 
  const appointmentsCollection = db.collection("appointments");
  let runtimeExecutionResult = "";

  if (functionName === "book_appointment") {
    const { patient_name, phone_number, preferred_time } = args;
    const trackingCode = generateTrackingCode();
    
    await appointmentsCollection.insertOne({
      trackingCode,
      name: patient_name,
      phone: phone_number,
      time: preferred_time,
      cost: "$400",
      createdAt: new Date()
    });

    runtimeExecutionResult = `Success! Appointment successfully registered for ${patient_name}. Slot locked at ${preferred_time}. Your tracking confirmation code is ${trackingCode}. Please remind them the deposit fee is $400 upon arrival.`;
  }
  else if (functionName === "cancel_appointment") {
    const { appointment_id } = args;
    const targetId = appointment_id?.toUpperCase().trim();
    const result = await appointmentsCollection.deleteOne({ trackingCode: targetId });

    if (result.deletedCount === 1) {
      runtimeExecutionResult = `Confirmed. The appointment file tagged under code ${targetId} has been completely dropped from our active schedule calendar.`;
    } else {
      runtimeExecutionResult = `Verification Failure. I scanned the system for code ${targetId} but no matching booking slot exists in our active directory tracking ledger.`;
    }
  }
  else if (functionName === "reschedule_appointment") {
    const { appointment_id, new_time } = args;
    const targetId = appointment_id?.toUpperCase().trim();
    
    const result = await appointmentsCollection.updateOne(
      { trackingCode: targetId },
      { $set: { time: new_time } }
    );

    if (result.matchedCount === 1) {
      const updatedAppointment = await appointmentsCollection.findOne({ trackingCode: targetId });
      runtimeExecutionResult = `Update complete. System code ${targetId} for patient ${updatedAppointment?.name} has been successfully moved over to the new slot at ${new_time}.`;
    } else {
      runtimeExecutionResult = `Modification Aborted. No appointment slot found corresponding to the reference ID code ${targetId}.`;
    }
  }

  return NextResponse.json({
    results: [
      {
        name: functionName,
        toolCallId: toolCallId,
        result: runtimeExecutionResult
      }
    ]
  }, { status: 200 });
}

function voicemailFallback() {
  return NextResponse.json({
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
      },
      systemPrompt:
        "Thank you for calling. The office reception desk is currently offline. Please leave your name, phone number, and a detailed message, and we will call you back as soon as possible.",
    },
  });
}