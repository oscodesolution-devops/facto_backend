import mongoose from "mongoose";

interface IUserDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subServiceId: mongoose.Types.ObjectId;
  documentType: string;
  title: string;
  description?: string;
  documentUrl: string;
}

interface UserDocumentModel extends mongoose.Model<IUserDocument> {}
export { UserDocumentModel, IUserDocument };
