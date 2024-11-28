import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";


export const getAllSubServiceRequirements = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { subServiceId } = req.params;
        console.log(subServiceId)
        if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
          return next(
            createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
          );
        }
  
        const subServiceRequirements = await db.SubServiceRequirement.find({
          subServiceId,
        });
  
        const response = sendSuccessApiResponse(
          "SubServiceRequirements retrieved successfully",
          { subServiceRequirements }
        );
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );