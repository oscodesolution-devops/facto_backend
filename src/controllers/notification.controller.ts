import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";

export const getAllNotifications = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const notifications = await db.Notification.find().sort({ createdAt: -1 });
  
        const response = sendSuccessApiResponse("Notifications retrieved successfully", { notifications });
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );