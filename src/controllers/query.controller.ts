import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";

export const addQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phoneNo, query } = req.body;
      if (!name || !email || !phoneNo || !query) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }
      const newQuery = await db.Query.create({
        name,
        email,
        phoneNo,
        query,
      });
      const response = sendSuccessApiResponse(
        "Query added successfully",
        newQuery
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
