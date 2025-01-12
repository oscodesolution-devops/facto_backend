import mongoose from "mongoose";

interface IApplication extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subServiceId: mongoose.Types.ObjectId;
  userDocuments: mongoose.Types.ObjectId[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  additionalNotes?: string;
  reviewComments?: string;
  requestedFeatures?: string[];
  createdAt: Date;
  updatedAt: Date;
  billingPeriod: string;
}

interface ApplicationModel extends mongoose.Model<IApplication> {}

export { IApplication, ApplicationModel };