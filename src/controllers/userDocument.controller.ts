import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { deleteCloudinaryUserDocument } from "@/middlewares/upload";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const uploadDocument = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const {subServiceId} = req.params;
      const { documentType, title, description } =
        req.body;
        const documentUrl =  req.body.documentUrl
      // Check for required fields
        console.log(userId,subServiceId,documentType,title)
      if (!userId || !subServiceId || !documentType || !title) {
        return next(
          createCustomError("Missing required fields", StatusCode.BAD_REQ)
        );
      }

      // Validate ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(subServiceId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      // Validate documentType
      if (!["required", "additional"].includes(documentType)) {
        return next(
          createCustomError("Invalid document type", StatusCode.BAD_REQ)
        );
      }

      // Check if a file was uploaded
      let userDocument = await db.UserDocument.findOne({
        userId,
        subServiceId,
        documentType,
        title,
      });

      if (userDocument) {
        // If a document exists, update it
        const oldDocumentUrl = userDocument.documentUrl;

        userDocument.description = description;
        userDocument.documentUrl = documentUrl;
        await userDocument.save();

        // Delete the old document from Cloudinary if the URL has changed
        if (oldDocumentUrl !== documentUrl) {
          await deleteCloudinaryUserDocument(oldDocumentUrl);
        }

        const response = sendSuccessApiResponse(
          "Document updated successfully",
          { userDocument }
        );
        return res.status(StatusCode.OK).send(response);
      } else {
        // If no document exists, create a new one
        userDocument = await db.UserDocument.create({
          userId,
          subServiceId,
          documentType,
          title,
          description,
          documentUrl,
        });

        const response = sendSuccessApiResponse(
          "Document uploaded successfully",
          { userDocument }
        );
        return res.status(StatusCode.CREATED).send(response);
      }
    } catch (error: any) {
      // If there's an error, we should delete the uploaded file from Cloudinary
      if (req.body.documentUrl) {
        await deleteCloudinaryUserDocument(req.body.documentUrl);
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update the removeDocument function to delete the file from Cloudinary
export const removeDocument = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?._id; // Assuming we're getting the userId from the authenticated user

      if (
        !mongoose.Types.ObjectId.isValid(documentId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const userDocument = await db.UserDocument.findOneAndDelete({
        _id: documentId,
        userId,
      });

      if (!userDocument) {
        return next(
          createCustomError(
            "Document not found or you don't have permission to delete it",
            StatusCode.NOT_FOUND
          )
        );
      }

      // Delete the file from Cloudinary
      await deleteCloudinaryUserDocument(userDocument.documentUrl);

      const response = sendSuccessApiResponse("Document removed successfully", {
        userDocument,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
