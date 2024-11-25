import { ISubService, SubServiceModel } from "@/interfaces";
import mongoose from "mongoose";

const SubServiceSchema = new mongoose.Schema<ISubService, SubServiceModel>(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly", "one_time"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubService = mongoose.model<ISubService, SubServiceModel>(
    "SubService",
    SubServiceSchema,
    "subService"
  );
  
  export default SubService;
  
