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

export const signup: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
      }:Partial<IUser> = req.body;

      if (
        !email &&
        !password &&
        !fullName 
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }
      const existingUser = await db.User.findOne({
        email: email,
      });
      if (existingUser) {
        return next(
          createCustomError(
            "This email is already registered.",
            StatusCode.BAD_REQ
          )
        );
      }
      const user: any = await db.User.create({
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
      });

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse("User Registered Successfully!", {
        user: userResponse,
        token,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const login: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return next(createCustomError("Email and password are required", StatusCode.BAD_REQ));
        }
  
        // Find user and explicitly select password
        const user = await db.User.findOne({ email }).select('+password');
  
        if (!user) {
          return next(createCustomError("Invalid credentials", StatusCode.UNAUTH));
        }
  
        // Compare password
        const isPasswordValid = password == user.password;
  
        if (!isPasswordValid) {
          return next(createCustomError("Invalid credentials", StatusCode.UNAUTH));
        }
  
        // Update last login
        user.lastLogin = new Date();
        await user.save();
  
        // Create token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
  
        const response = sendSuccessApiResponse(
          "Login Successful!",
          { user: userResponse, token }
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );
  