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

      // Find all user purchases of type 'service' with populated payment details
      const userPurchases = await db.UserPurchase.find({ 
        userId: userId, 
        itemType: 'service' 
      }).populate({
        path: "paymentOrderId",
        select: "amount" // Populate only the required payment details
      });

      // Extract sub-service IDs from purchases
      const purchasedServiceIds = userPurchases.map((purchase) => purchase.itemId);

      // Fetch full sub-service details for purchased services
      const services = await db.SubService.find({
        _id: { $in: purchasedServiceIds },
        isActive: true
      }).populate({
        path: 'serviceId', // Populate the parent service details
        select: 'title' // Select only the title of the parent service
      });

      // Map user purchases to services with payment and purchase details
      const servicesWithPurchaseInfo = userPurchases.map((purchase) => {
        // Find the matching service for the current purchase
        const service = services.find(
          (service) => service._id.toString() === purchase.itemId.toString()
        );

        if (!service) {
          return null; // Skip if no matching service found
        }

        // Populate additional details
        return {
          ...service.toObject(), // Convert to plain object
          purchaseDate: purchase.createdAt,
          selectedFeatures: purchase.selectedFeatures,
          purchasedPrice: purchase.paymentOrderId ? purchase.paymentOrderId?.amount : null,
        };
      }).filter(Boolean); // Remove null entries

      // Send the response
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

// export const getYourServices = bigPromise(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     try {
//       const userId = req.user.id; // Assuming you have middleware that attaches user info to the request

//       // Find all user purchases of type 'service'
//       const userPurchases = await db.UserPurchase.find({ 
//         userId: userId, 
//         itemType: 'service' 
//       }).populate("paymentOrderId");

//       console.log(userPurchases,"fff")

//       // Extract sub-service IDs from purchases
//       const purchasedServiceIds = userPurchases.map(purchase => purchase.itemId);
//       console.log(purchasedServiceIds)
//       // Fetch full sub-service details for purchased services
//       const services = await db.SubService.find({
//         _id: { $in: purchasedServiceIds },
//         isActive: true
//       }).populate({
//         path: 'serviceId', // Populate the parent service details
//         select: 'title' // Select only the title of the parent service
//       });
      
//       // Map results back to match the order and duplicates in `purchasedServiceIds`
//       const servicesWithDuplicates = purchasedServiceIds.map(id =>
//         services.find(service => service._id.toString() === id.toString())
//       );
      

//       console.log(services);

//       // Optional: Add purchase details to the response
//       const servicesWithPurchaseInfo =await Promise.all( servicesWithDuplicates.map(async(service) => {
//         const purchase = userPurchases.find(p => 
//           p.itemId.toString() === service._id.toString()
//         );

//         const payment = await db.PaymentOrder.findById(purchase.paymentOrderId)
//         console.log(purchase.paymentOrderId,"sss")
//         return {
//           ...service.toObject(), // Convert to plain object
//           purchaseDate: purchase ? purchase.createdAt : null,
//           selectedFeatures: purchase ? purchase.selectedFeatures : [],
//           purchasedPrice: payment ? payment.amount : null
//         };
//       }))


//       const response = sendSuccessApiResponse(
//         "Your Purchased Services",
//         servicesWithPurchaseInfo
//       );
      
//       res.status(StatusCode.OK).send(response);
//     } catch (error) {
//       next(createCustomError(error.message, StatusCode.INT_SER_ERR));
//     }
//   }
// );