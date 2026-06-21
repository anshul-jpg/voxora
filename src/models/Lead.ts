import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILead extends Document {
  orgId: mongoose.Types.ObjectId;
  phone: string;
  name?: string;
  email?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  customData: Map<string, any>;
  lastCallId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    phone: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },
    customData: { type: Map, of: Schema.Types.Mixed, default: {} },
    lastCallId: { type: String },
  },
  {
    timestamps: true,
  }
);

// Wildcard Indexing for dynamic fields
LeadSchema.index({ "customData.$**": 1 });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
