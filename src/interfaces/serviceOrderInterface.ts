import mongoose from "mongoose";

interface IServiceOrder extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  subServiceId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string;
  startDate: Date;
  endDate: Date;
}

interface ServiceOrderModel extends mongoose.Model<IServiceOrder> {}
export { ServiceOrderModel, IServiceOrder };
