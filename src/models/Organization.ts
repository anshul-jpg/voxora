import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDashboardColumn {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  isPinned: boolean;
  options?: string[]; // For enum types
}

export interface IOrganization extends Document {
  name: string;
  vapiPhoneNumberId?: string;
  dashboardColumns: IDashboardColumn[];
  leadExtractionSchema: Record<string, any>;
  subscriptionTier: string;
  createdAt: Date;
  updatedAt: Date;
}

const DashboardColumnSchema = new Schema<IDashboardColumn>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["string", "number", "boolean", "date", "enum"],
    required: true,
  },
  isPinned: { type: Boolean, default: false },
  options: [{ type: String }],
});

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    vapiPhoneNumberId: { type: String },
    dashboardColumns: [DashboardColumnSchema],
    leadExtractionSchema: { type: Schema.Types.Mixed, default: {} },
    subscriptionTier: { type: String, default: "professional" },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recreating the model if it already exists in cache
const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
