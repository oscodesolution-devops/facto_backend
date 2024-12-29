import { sendOTP, verifyOTP } from "@/config/twilio";
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { IUser } from "@/interfaces";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

  
  export const sendOtp: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phoneNo } = req.body;
  
        if (!phoneNo ) {
          return next(createCustomError("Phone number is required", StatusCode.BAD_REQ));
        }
  
      
        await sendOTP("+91"+String(phoneNo));
        

        
        const response = sendSuccessApiResponse(
          "OTP sent Successful!",
          {}
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  export const verifyOtp: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phoneNo, otp } = req.body;
  
        if (!phoneNo || !otp) {
          return next(createCustomError("Phone Number and Otp are required", StatusCode.BAD_REQ));
        }
  
        // Find user and explicitly select password
        let user = await db.User.findOne({ phoneNumber:phoneNo });
  
        if (!user) {
          user = await db.User.create({phoneNumber:phoneNo});
        }
  
        // Compare password
        const status = await verifyOTP("+91"+String(phoneNo),otp)
        if(!(status=="approved")){
          return next(createCustomError("Invalid OTP", StatusCode.UNAUTH));
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
  
        // Create token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET
        );
        // Remove password from response
        // const userResponse = user.toObject();
        // delete userResponse.password;
  
        const response = sendSuccessApiResponse(
          "Login Successful!",
          { user: user, token }
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );
  
  