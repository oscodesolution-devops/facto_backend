import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const getAllSubServicesbyServiceId = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;
      const subServices = await db.SubService.find({ serviceId });

      const response = sendSuccessApiResponse(
        "SubServices retrieved successfully",
        { subServices }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getSubServiceById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findById(subServiceId);

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "SubService retrieved successfully",
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getYourServices = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // Assuming you have middleware that attaches user info to the request

      // Find all user purchases of type 'service'
      const userPurchases = await db.UserPurchase.find({ 
        userId: userId, 
        itemType: 'service' 
      });

      // Extract sub-service IDs from purchases
      const purchasedServiceIds = userPurchases.map(purchase => purchase.itemId);

      // Fetch full sub-service details for purchased services
      const services = await db.SubService.find({
        _id: { $in: purchasedServiceIds },
        isActive: true
      }).populate({
        path: 'serviceId', // Populate the parent service details
        select: 'title' // Select only the title of the parent service
      });

      // Optional: Add purchase details to the response
      const servicesWithPurchaseInfo = services.map(service => {
        const purchase = userPurchases.find(p => 
          p.itemId.toString() === service._id.toString()
        );

        return {
          ...service.toObject(), // Convert to plain object
          purchaseDate: purchase ? purchase.createdAt : null,
          selectedFeatures: purchase ? purchase.selectedFeatures : []
        };
      });

      const response = sendSuccessApiResponse(
        "Your Purchased Services",
        servicesWithPurchaseInfo
      );
      
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);