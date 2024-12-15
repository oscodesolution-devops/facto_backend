import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";

export const getCourses = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await db.Course.find({ status: "published" }).populate({
        path: "lectures",
        match: { isFree: true },
      });
      const response = sendSuccessApiResponse(
        "Courses Fetched Successfully",
        courses
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getCourseById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      const course = await db.Course.findById(courseId).populate({
        path: "lectures",
        match: { isFree: true },
      });
      const response = sendSuccessApiResponse(
        "Course Fetched Successfully",
        course
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getYourCourses = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // Assuming you have middleware that attaches user info to the request

      // Find all user purchases of type 'course'
      const userPurchases = await db.UserPurchase.find({ 
        userId: userId, 
        itemType: 'course' 
      });

      // Extract course IDs from purchases
      const purchasedCourseIds = userPurchases.map(purchase => purchase.itemId);

      // Fetch full course details for purchased courses
      const courses = await db.Course.find({
        _id: { $in: purchasedCourseIds },
        status: 'published'
      }).populate({
        path: 'lectures'
      });

      const response = sendSuccessApiResponse(
        "Your Purchased Courses",
        courses
      );
      
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);





