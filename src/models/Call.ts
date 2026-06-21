import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICall extends Document {
  callId: string;
  orgId: mongoose.Types.ObjectId;
  status: "queued" | "in-progress" | "completed" | "failed";
  durationSeconds?: number;
  cost?: number;
  terminationReason?: string;
  recordingUrl?: string;
  transcript?: string;
  promptVersion?: string;
  rawTelemetry?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    callId: { type: String, required: true, unique: true, trim: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    status: {
      type: String,
      enum: ["queued", "in-progress", "completed", "failed"],
      default: "completed",
    },
    durationSeconds: { type: Number },
    cost: { type: Number },
    terminationReason: { type: String },
    recordingUrl: { type: String },
    transcript: { type: String },
    promptVersion: { type: String },
    rawTelemetry: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Enforce idempotency
CallSchema.index({ callId: 1 }, { unique: true });

const Call: Model<ICall> = mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);

export default Call;
