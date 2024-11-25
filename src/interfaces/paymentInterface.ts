import mongoose from "mongoose";

interface IPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  orderType: "course" | "service";
  orderId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: "pending" | "successful" | "failed";
}

interface PaymentModel extends mongoose.Model<IPayment> {}
export { PaymentModel, IPayment };
