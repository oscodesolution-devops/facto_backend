import { IService, ServiceModel } from "@/interfaces";
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema<IService, ServiceModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon:{
        type:String,
        default:"http"
    }
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model<IService, ServiceModel>(
  "Service",
  ServiceSchema,
  "service"
);

export default Service;
