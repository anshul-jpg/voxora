const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const uri = process.env.MONGODB_URI;

async function testWebhook() {
  await mongoose.connect(uri);
  const db = mongoose.connection;
  
  // Seed org
  const orgResult = await db.collection('organizations').findOneAndUpdate(
    { vapiPhoneNumberId: "vapi_phone_123" },
    { $set: { name: "Test Org", vapiPhoneNumberId: "vapi_phone_123", subscriptionTier: "professional" } },
    { upsert: true, returnDocument: 'after' }
  );

  const payload = {
    message: {
      type: "end-of-call-report",
      call: {
        id: "call_" + Date.now(),
        phoneNumberId: "vapi_phone_123",
        status: "completed",
        durationSeconds: 120,
        cost: 0.15,
        endedReason: "customer_hung_up",
        customer: {
          number: "+1234567890"
        }
      },
      recordingUrl: "https://example.com/recording.wav",
      transcript: "Hello, this is a test.",
      analysis: {
        structuredData: {
          name: "John Doe",
          email: "john@example.com",
          fitnessGoal: "Weight Loss",
          preferredTime: "Morning"
        }
      }
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/vapi-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testWebhook();
