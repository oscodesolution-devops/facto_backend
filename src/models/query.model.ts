import { IQuery, QueryModel } from "@/interfaces";
import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema<IQuery, QueryModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name is too short"],
      maxlength: [50, "Name is too long"],
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z ]+$/.test(v);
        },
        message: "Full name should only contain letters and spaces",
      },
    },
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
    query: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const Query = mongoose.model<IQuery, QueryModel>("Query", QuerySchema, "query");

export default Query;
