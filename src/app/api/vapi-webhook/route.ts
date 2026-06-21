import { NextResponse } from "next/server";
import clientPromise, { connectDB } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";

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
    // 🛡️ RATE LIMITING: 20 webhook requests per 1 minute
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

    // Optional Webhook Secret Verification (if configured in environment)
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get("x-vapi-secret");
      if (authHeader !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    console.log("🚀 Incoming Webhook Event Type:", payload.message?.type);

    if (payload.message?.type === "assistant-request") {
      const vapiPhoneNumberId = payload.message?.call?.phoneNumberId;
      await connectDB();
      const Organization = (await import("@/models/Organization")).default;
      const org = await Organization.findOne({ vapiPhoneNumberId });
      
      const response = {
        assistant: {
          analysisPlan: {
            structuredDataSchema: org?.leadExtractionSchema || {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
              }
            }
          },
          maxDurationSeconds: 1800
        }
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (payload.message?.type === "end-of-call-report") {
      const callId = payload.message.call.id;
      await connectDB();
      const Call = (await import("@/models/Call")).default;
      const Lead = (await import("@/models/Lead")).default;
      const Organization = (await import("@/models/Organization")).default;

      const org = await Organization.findOne({ vapiPhoneNumberId: payload.message.call.phoneNumberId });
      
      try {
        await Call.create({
          callId,
          orgId: org?._id,
          status: payload.message.call.status || "completed",
          durationSeconds: payload.message.call.durationSeconds,
          cost: payload.message.call.cost,
          terminationReason: payload.message.call.endedReason,
          recordingUrl: payload.message.recordingUrl,
          transcript: payload.message.transcript,
          rawTelemetry: payload.message
        });
      } catch (err: any) {
        if (err.code === 11000) {
          console.log("Duplicate call webhook received, ignoring.");
          return NextResponse.json({ status: "already_processed" }, { status: 200 });
        }
        throw err;
      }

      const structuredData = payload.message.analysis?.structuredData || {};
      const updatePayload: any = {
        lastCallId: callId,
      };
      
      for (const [key, value] of Object.entries(structuredData)) {
        if (key === "name" || key === "email") {
            updatePayload[key] = value;
        } else {
            updatePayload[`customData.${key}`] = value;
        }
      }

      const customerPhone = payload.message.call.customer?.number || "Unknown";
      
      if (org) {
        await Lead.findOneAndUpdate(
          { phone: customerPhone, orgId: org._id },
          { $set: updatePayload, $setOnInsert: { orgId: org._id, phone: customerPhone, status: "new" } },
          { upsert: true, new: true }
        );
      }

      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    if (payload.message?.type === "tool-calls") {
      const toolCall = payload.message.toolCallList?.[0] || payload.message.toolCall;
      if (!toolCall) {
        return NextResponse.json({ error: "No active tool payload found" }, { status: 400 });
      }

      // Extract cleanly whether it is nested (Vapi) or flat (Curl test)
      const functionName = toolCall.function?.name || toolCall.name;
      const toolCallId = toolCall.id;
      
      // Pull parameters safely from either nested structure or flat fallback maps
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

      // ------------------------------------------------------------
      // ACTION A: BOOK APPOINTMENT
      // ------------------------------------------------------------
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
      // ------------------------------------------------------------
      // ACTION B: CANCEL APPOINTMENT
      // ------------------------------------------------------------
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
      // ------------------------------------------------------------
      // ACTION C: RESCHEDULE APPOINTMENT
      // ------------------------------------------------------------
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

    return NextResponse.json({ status: "ignored_event" }, { status: 200 });

  } catch (error) {
    console.error("💥 Execution Error:", error);
    return NextResponse.json({
      results: [
        {
          name: "error_handler",
          toolCallId: "error",
          result: "An internal database connection delay occurred. Please try again."
        }
      ]
    }, { status: 200 });
  }
}