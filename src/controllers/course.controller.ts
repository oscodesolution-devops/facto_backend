import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
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





