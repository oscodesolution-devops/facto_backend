import { IUser, UserModel } from "@/interfaces";
import mongoose from "mongoose";
// import { IUser, UserModel } from "../interfaces/index.js";

const UserSchema = new mongoose.Schema<IUser, UserModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should be at least 6 characters"],
    },
    fullName: {
      type: String,
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
    phoneNumber: {
      type: Number,
      unique: true,
      
      validate: {
        validator: function (v: number) {
          return /^[6-9]\d{9}$/.test(v.toString());
        },
        message: "Please enter a valid 10-digit Indian mobile number",
      },
    },
    aadharNumber: {
      type: Number,
    
    },
    panNumber: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    profilePictureUrl: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      default: "user",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model<IUser, UserModel>("User", UserSchema, "user");

export default User;
