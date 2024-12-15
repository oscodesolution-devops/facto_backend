import { IUserPurchase, UserPurchaseModel } from "@/interfaces";
import mongoose from "mongoose";

const UserPurchaseSchema = new mongoose.Schema<IUserPurchase, UserPurchaseModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["course", "service"],
      required: true,
    },
    selectedFeatures: [String],
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "itemType",
      required: true,
    },
    paymentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentOrder",
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);



// Pre-save middleware to set expiryDate for services
// UserPurchaseSchema.pre("save", async function (next) {
//   if (this.isNew && this.itemType === "service") {
//     const SubService = mongoose.model("SubService");
//     const service = await SubService.findById(this.itemId);
//     if (service) {
//       const now = new Date();
//       switch (service.period) {
//         case "monthly":
//           this.expiryDate = new Date(now.setMonth(now.getMonth() + 1));
//           break;
//         case "quarterly":
//           this.expiryDate = new Date(now.setMonth(now.getMonth() + 3));
//           break;
//         case "half_yearly":
//           this.expiryDate = new Date(now.setMonth(now.getMonth() + 6));
//           break;
//         case "yearly":
//           this.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
//           break;
//         case "one_time":
//           this.expiryDate = undefined;
//           break;
//       }
//     }
//   }
//   next();
// });

const UserPurchase = mongoose.model<IUserPurchase, UserPurchaseModel>(
  "UserPurchase",
  UserPurchaseSchema,
  "UserPurchase"
);

export default UserPurchase;

