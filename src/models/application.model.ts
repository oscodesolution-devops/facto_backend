// models/Application.ts
import mongoose from "mongoose";
import { IApplication, ApplicationModel } from "@/interfaces";

const ApplicationSchema = new mongoose.Schema<IApplication, ApplicationModel>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubService",
    required: true,
  },
  userDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDocument",
  }],
  status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "approved", "rejected"],
    default: "draft",
  },
  additionalNotes: {
    type: String,
  },
  reviewComments: {
    type: String,
  },
  requestedFeatures: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const Application = mongoose.model<IApplication, ApplicationModel>(
  "Application",
  ApplicationSchema,
  "application"
);

export default Application;