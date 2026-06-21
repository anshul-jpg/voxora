import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDemoLead extends Document {
  name?: string;
  phone: string;
  email?: string;
  company?: string;
  callDurationSeconds?: number;
  isQualified: boolean;
  notes?: string;
  callId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoLeadSchema = new Schema<IDemoLead>(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    callDurationSeconds: { type: Number },
    isQualified: { type: Boolean, default: false },
    notes: { type: String },
    callId: { type: String }, // optional ref to raw call log
  },
  {
    timestamps: true,
  }
);

const DemoLead: Model<IDemoLead> =
  mongoose.models.DemoLead || mongoose.model<IDemoLead>("DemoLead", DemoLeadSchema);

export default DemoLead;
