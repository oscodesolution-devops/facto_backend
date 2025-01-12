import mongoose from "mongoose";
import { IUser, UserModel } from "@/interfaces";
import { validate } from "uuid";

const UserSchema = new mongoose.Schema<IUser, UserModel>(
  {
    // Basic Details
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: "Please enter a valid email address",
      },
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
    fathersName:{
      type: String,
      trim: true,
      minlength: [2, "Name is too short"],
      maxlength: [50, "Name is too long"],
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z ]+$/.test(v);
        },
        message: "Fathers name should only contain letters and spaces",
      },
    },
    alternativePhone:{
      type: String,
      validate: {
        validator: function (v: string) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit Indian mobile number",
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit Indian mobile number",
      },
    },
    panNumber: {
      type: String,
    },
    aadharNumber: {
      type: Number,
    },
    dateOfBirth: {
      type: Date,
    },
    state: {
      type: String,
    },
    address: {
      type: String,
    },

    // GST Profile
    gstProfile: {
      gstPortalLoginId: {
        type: String,
        
      },
      gstPassword: {
        type: String,
        
      },
      gstNumber: {
        type: String,
        
      },
      tradeName: {
        type: String,
        
      },
      additionalTradeName: {
        type: String,
        // Not required as it's optional in the form
      },
      gstrType: {
        type: String,
        enum: ["regular", "composition", "unregistered"],
        
      },
      returnType: {
        type: String,
        enum: ["GSTR-1", "GSTR-IFF", "GSTR-3B", "other"],
        
      }
    },
    incomeTaxProfile:{
      password: String,
      itrType: {
        type:String,
        enum:["ITR-1","ITR-2","ITR-3","ITR-4","ITR-5","ITR-6"]
      },
      bankDetails:{
        accountNumber:String,
        ifscCode: String,
      }
    },

    // Other Details
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
        values: ["user", "admin", "employee"],
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
    password: {
      type:String,
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model<IUser, UserModel>("User", UserSchema, "user");

export default User;
