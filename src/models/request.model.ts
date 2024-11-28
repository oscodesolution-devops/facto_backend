import { IRequest, RequestModel } from "@/interfaces";
import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema<IRequest, RequestModel>(
  {
    phoneNo: {
      type: Number,
      required:true,
      validate: {
        validator: function (v: number) {
          return /^[6-9]\d{9}$/.test(v.toString());
        },
        message: "Please enter a valid 10-digit Indian mobile number",
      },
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    }
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model<IRequest, RequestModel>("Request", RequestSchema, "request");

export default Request;
