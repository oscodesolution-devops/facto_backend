import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";

export const addRequest = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phoneNo} = req.body;
        if(!phoneNo){
            return next(
                createCustomError(
                  "Phone Number is required", 
                  StatusCode.BAD_REQ
                )
              );
        }
        const newRequest = await db.Request.create({
            phoneNo,
        })
        const response = sendSuccessApiResponse("Request added successfully", newRequest);
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  export const assignEmployee = bigPromise(
    async(req: Request, res: Response, next: NextFunction) => {
      const { employeeId } = req.body;
      const { id } = req.params;
  
      try {
        // Validate required fields
        if (!employeeId) {
          return next(
            createCustomError(
              "Employee ID is required",
              StatusCode.BAD_REQ
            )
          );
        }
  
        if (!id) {
          return next(
            createCustomError(
              "Request ID is required",
              StatusCode.BAD_REQ
            )
          );
        }
  
        // Find the request document and update it
        const updatedRequest = await db.Request.findByIdAndUpdate(
          id,
          { assignee: employeeId },
          { new: true, runValidators: true }
        );
  
        // Check if request exists
        if (!updatedRequest) {
          return next(
            createCustomError(
              "Request not found",
              StatusCode.NOT_FOUND
            )
          );
        }
  
        const response = sendSuccessApiResponse(
          "Employee assigned successfully",
          updatedRequest
        );
        
        res.status(StatusCode.OK).send(response);
  
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );