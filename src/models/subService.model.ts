import { ISubService, SubServiceModel } from "@/interfaces";
import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    priceModifier: {
      type: Number,
      required: true,
    },
    needsQuotation: {
      type: Boolean,
      required: true,
    },
    inputType: {
      type: String,
      enum: ["dropdown", "checkbox"],
      required: true,
    },
    isMultipleSelect: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        name: { type: String, required: true },
        priceModifier: { type: Number, required: true },
        needsQuotation: { type: Boolean, required: true },
      },
    ],
  },
  { _id: false } // No need to have a separate `_id` for each request
);

const SubServiceSchema = new mongoose.Schema(
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
    requests: [RequestSchema], // Embedded RequestSchema
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
    pricingStructure: [
      {
        price: { type: Number, required: true },
        period: {
          type: String,
          enum: ["monthly", "quarterly", "half_yearly", "yearly", "one_time"],
          required: true,
        },
      },
    ],
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
