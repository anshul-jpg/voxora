import { NextResponse } from "next/server";

// Simulating a persistent centralized database store in memory
interface Appointment {
  id: string;
  name: string;
  phone: string;
  time: string;
  cost: string;
}

let appointmentsDatabase: Record<string, Appointment> = {
  "APX-99": {
    id: "APX-99",
    name: "John Doe",
    phone: "1234567890",
    time: "11:30 AM",
    cost: "$400",
  },
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("🚀 Incoming Webhook Event Type:", payload.message?.type);

    // Filter for Tool Call triggers
    if (payload.message?.type === "tool-calls") {
      const toolCall = payload.message.toolCallList[0];
      const { name: functionName, id: toolCallId, parameters: args } = toolCall;

      let runtimeExecutionResult = "";

      // -------------------------------------------------------------
      // ACTION A: BOOK APPOINTMENT
      // -------------------------------------------------------------
      if (functionName === "book_appointment") {
        const { patient_name, phone_number, preferred_time } = args;

        // Generate pseudo-random alphanumeric tracking token
        const generatedId = `APX-${Math.floor(100 + Math.random() * 900)}`;

        // Append new data record to structural map
        appointmentsDatabase[generatedId] = {
          id: generatedId,
          name: patient_name,
          phone: phone_number,
          time: preferred_time,
          cost: "$400",
        };

        runtimeExecutionResult = `Success! Appointment successfully registered for ${patient_name}. Slot locked at ${preferred_time}. Your tracking confirmation code is ${generatedId}. Please remind them the deposit fee is $400 upon arrival.`;
      }

      // -------------------------------------------------------------
      // ACTION B: CANCEL APPOINTMENT
      // -------------------------------------------------------------
      else if (functionName === "cancel_appointment") {
        const { appointment_id } = args;
        const targetId = appointment_id.toUpperCase().trim();

        if (appointmentsDatabase[targetId]) {
          const originalRecordName = appointmentsDatabase[targetId].name;
          delete appointmentsDatabase[targetId];
          runtimeExecutionResult = `Confirmed. The appointment file tagged under code ${targetId} for patient ${originalRecordName} has been completely dropped from our active schedule calendar.`;
        } else {
          runtimeExecutionResult = `Verification Failure. I scanned the system for code ${targetId} but no matching booking slot exists in our active directory tracking ledger.`;
        }
      }

      // -------------------------------------------------------------
      // ACTION C: RESCHEDULE APPOINTMENT
      // -------------------------------------------------------------
      else if (functionName === "reschedule_appointment") {
        const { appointment_id, new_time } = args;
        const targetId = appointment_id.toUpperCase().trim();

        if (appointmentsDatabase[targetId]) {
          appointmentsDatabase[targetId].time = new_time;
          runtimeExecutionResult = `Update complete. System code ${targetId} for patient ${appointmentsDatabase[targetId].name} has been successfully moved over to the new slot at ${new_time}.`;
        } else {
          runtimeExecutionResult = `Modification Aborted. No appointment slot found corresponding to the reference ID code ${targetId}.`;
        }
      }

      console.log(
        "📊 Active Database State Snapshot:",
        JSON.stringify(appointmentsDatabase, null, 2)
      );

      // Return the response back to Vapi in their mandatory single-line array format
      return NextResponse.json(
        {
          results: [
            {
              toolCallId: toolCallId,
              result: runtimeExecutionResult,
            },
          ],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ status: "ignored_event" }, { status: 200 });
  } catch (error) {
    console.error("💥 Execution Error:", error);
    return NextResponse.json(
      { error: "Internal functional process error" },
      { status: 500 }
    );
  }
}
