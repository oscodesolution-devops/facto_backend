// controllers/applicationController.ts
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// Create/Submit an Application
export const createApplication = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // From auth middleware
      const { 
        subServiceId, 
        userDocuments = [], 
        additionalNotes, 
        billingPeriod,
        requestedFeatures,
        status = "submitted" 
      } = req.body;
      if(!(subServiceId&&billingPeriod)){
        return  next(
          createCustomError("please fill all the required details", StatusCode.BAD_REQ)
        );
      }
      // Validate SubService exists
      const subService = await db.SubService.findById(subServiceId);
      if (!subService) {
        return next(
          createCustomError("Invalid SubService", StatusCode.BAD_REQ)
        );
      }

      // Validate user documents
      const validatedDocuments = await Promise.all(
        userDocuments.map(async (docId: string) => {
          const doc = await db.UserDocument.findOne({ 
            _id: docId, 
            userId: userId,
            subServiceId: subServiceId
          });
          return doc ? doc._id : null;
        })
      );

      const filteredDocuments = validatedDocuments.filter(doc => doc !== null);

      const application = new db.Application({
        userId,
        subServiceId,
        userDocuments: filteredDocuments,
        status,
        billingPeriod,
        additionalNotes,
        requestedFeatures
      });

      await application.save();

      const response = sendSuccessApiResponse(
        "Application submitted successfully",
        { 
          application,
          message: status === "submitted" 
            ? "Your application has been submitted for review" 
            : "Application draft saved"
        },
        StatusCode.CREATED
      );

      res.status(StatusCode.CREATED).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get User's Applications
export const getUserApplications = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // From auth middleware

      const applications = await db.Application.find({ userId })
        .populate({
          path: 'subServiceId',
          select: 'title description price period' // Select specific fields
        })
        .populate({
          path: 'userDocuments',
          select: 'title documentType documentUrl' // Select specific document fields
        })
        .sort({ createdAt: -1 }); // Sort by most recent first

      const response = sendSuccessApiResponse(
        "User applications retrieved successfully",
        { 
          applications,
          total: applications.length
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get Single Application by ID
export const getApplicationById = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;
      const userId = req.user.id; // From auth middleware

      // Validate application ID
      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return next(
          createCustomError("Invalid Application ID", StatusCode.BAD_REQ)
        );
      }

      const application = await db.Application.findOne({ 
        _id: applicationId, 
        userId: userId 
      })
        .populate({
          path: 'subServiceId',
          select: 'title description price period'
        })
        .populate({
          path: 'userDocuments',
          select: 'title documentType documentUrl'
        });

      if (!application) {
        return next(
          createCustomError("Application not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Application retrieved successfully",
        { application }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get Applications by SubService ID
export const getApplicationBySubService = bigPromise(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { subServiceId } = req.params;
        const userId = req.user.id; // From auth middleware
  
        // Validate SubService ID
        console.log(subServiceId)
        if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
          return next(
            createCustomError("Invalid SubService ID", StatusCode.BAD_REQ)
          );
        }
  
        // Find applications for the specific user and subService
        const applications = await db.Application.find({ 
          userId: userId,
          subServiceId: subServiceId 
        })
          .populate({
            path: 'subServiceId',
            select: 'title description price period' // Select specific fields
          })
          .populate({
            path: 'userDocuments',
            select: 'title documentType documentUrl' // Select document details including URL
          })
          .sort({ createdAt: -1 }); // Sort by most recent first
  
        // If no applications found, return an empty array
        if (applications.length === 0) {
          const response = sendSuccessApiResponse(
            "No applications found for this sub-service",
            { 
              applications: [],
              total: 0 
            }
          );
  
          return res.status(StatusCode.OK).send(response);
        }
  
        // Prepare response
        const response = sendSuccessApiResponse(
          "Applications retrieved successfully by sub-service",
          { 
            applications,
            total: applications.length
          }
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );