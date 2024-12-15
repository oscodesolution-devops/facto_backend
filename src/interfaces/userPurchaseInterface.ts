import mongoose, { Document, Model } from 'mongoose';

export interface IUserPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'course' | 'service';
  itemId: mongoose.Types.ObjectId;
  paymentOrderId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  expiryDate?: Date;
  selectedFeatures: string[];
  status: 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPurchaseModel extends Model<IUserPurchase> {}

