import { Request, Response, NextFunction } from 'express';
import { createCustomError } from '@/errors/customAPIError';
import { StatusCode } from '@/constants/constants';
import { sendSuccessApiResponse } from '@/middlewares/successApiResponse';
import bigPromise from '@/middlewares/bigPromise';
import { AuthRequest } from '@/middlewares/auth';
import { IUser } from '@/interfaces';
import mongoose from 'mongoose';
import { db } from '@/models';

export const getUserDetails = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(createCustomError('User not found', StatusCode.NOT_FOUND));
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse('User details retrieved successfully', { user: userResponse });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editOwnProfile = bigPromise(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const user = req.user;
        const {
          fullName,
          phoneNumber,
          profilePictureUrl,
          panNumber,
          aadharNumber,
        }: Partial<IUser> = req.body;
  
        if (!user) {
          return next(createCustomError('User not found', StatusCode.NOT_FOUND));
        }
  
        // Update user fields
        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;
        if (panNumber) user.panNumber = panNumber;
        if (aadharNumber) user.aadharNumber = aadharNumber;
  
        await user.save();
  
        const updatedUser = user.toObject();
        delete updatedUser.password;
  
        const response = sendSuccessApiResponse("Profile updated successfully", { user: updatedUser });
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        if (error.name === "ValidationError") {
          return next(createCustomError(error.message, StatusCode.BAD_REQ));
        }
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );
  


export const getAllDocumentsByUserId = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user?._id;

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      // Fetch user documents with populated subService
      const userDocuments = await db.UserDocument.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
          $lookup: {
            from: 'subService', // Make sure this matches your SubService collection name
            localField: 'subServiceId',
            foreignField: '_id',
            as: 'subService'
          }
        },
        {
          $unwind: '$subService'
        },
        {
          $project: {
            _id: 1,
            documentType: 1,
            title: 1,
            description: 1,
            documentUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            'subService._id': 1,
            'subService.title': 1
          }
        }
      ]);

      if (userDocuments.length === 0) {
        return next(createCustomError("No documents found for this user", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse(
        "User documents retrieved successfully",
        { userDocuments }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

  

