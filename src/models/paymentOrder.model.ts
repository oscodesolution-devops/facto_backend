import { IPaymentOrder, PaymentOrderModel } from "@/interfaces";
import mongoose from "mongoose";

const PaymentOrderSchema = new mongoose.Schema<IPaymentOrder, PaymentOrderModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ["course", "service"],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "items.itemType",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

PaymentOrderSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((total, item) => total + item.price , 0);
});


const PaymentOrder = mongoose.model<IPaymentOrder, PaymentOrderModel>(
  "PaymentOrder",
  PaymentOrderSchema,
  "PaymentOrder"
);

export default PaymentOrder;

