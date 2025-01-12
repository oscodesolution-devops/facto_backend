import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Response } from "express";

export const createQuotation = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { subServiceId, selectedFeatures } = req.body;
  
      // Validate required fields
      if (!userId || !subServiceId || !selectedFeatures || !Array.isArray(selectedFeatures)) {
        return res.status(StatusCode.BAD_REQ).json({
          success: false,
          message: "User ID, Sub Service ID, and Selected Features (as an array) are required",
        });
      }
  
      // Create quotation
      const newQuotation = await db.Quotation.create({
        userId,
        subServiceId,
        selectedFeatures,
      });  

      // Send success response
      const response = sendSuccessApiResponse("Quotation created successfully", newQuotation);
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getUserQuotations = bigPromise(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.user._id;
  
        const quotations = await db.Quotation.find({ userId })
          .populate({
            path: 'subServiceId',
           })
          .sort({ createdAt: -1 });
  
  
        const response = sendSuccessApiResponse(
          "User quotations retrieved successfully", 
          quotations
        );
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
);