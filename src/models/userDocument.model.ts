import { IUserDocument, UserDocumentModel } from "@/interfaces/userDocumentInterface";
import mongoose from "mongoose";

const UserDocumentSchema = new mongoose.Schema<IUserDocument,UserDocumentModel>({
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
  documentType: {
    type: String,
    enum: ["required", "additional"], // "required" for mandatory docs, "additional" for user-added docs
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  documentUrl: {
    type: String,
    required: true, // URL to the uploaded document (e.g., Cloudinary link)
  },
}, {
  timestamps: true,
});

const UserDocument = mongoose.model<IUserDocument, UserDocumentModel>(
    "UserDocument",
    UserDocumentSchema,
    "userDocument"
  );
export default UserDocument;
