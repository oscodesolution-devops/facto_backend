import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import bigPromise from "@/middlewares/bigPromise";
import { db } from "@/models";

export const getBlogs = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { 
          search = '', 
          tag, 
          page = 1, 
          limit = 10 
        } = req.query;
  
        // Build filter
        const filter: any = { 
        };
        
        // Text search
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } }
          ];
        }
  
        // Tag filtering
        if (tag) {
          filter.tags = tag;
        }
  
        // Pagination
        const options = {
          select: 'title imageUrl createdAt tags',
          sort: { createdAt: -1 },
          limit: Number(limit),
          skip: (Number(page) - 1) * Number(limit)
        };
  
        // Fetch blogs
        const blogs = await db.Blog.find(filter, null, options);
        const total = await db.Blog.countDocuments(filter);
  
        const response = sendSuccessApiResponse(
          "Blogs retrieved successfully", 
          { 
            blogs, 
            pagination: {
              currentPage: Number(page),
              totalPages: Math.ceil(total / Number(limit)),
              totalBlogs: total
            }
          }
        );
        res.status(StatusCode.OK).send(response);
      } catch (error) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

export const getBlogById = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
  
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return next(
            createCustomError("Invalid blog ID", StatusCode.BAD_REQ)
          );
        }
  
        // Fetch blog
        const blog = await db.Blog.findById(id);
  
        if (!blog) {
          return next(
            createCustomError("Blog not found", StatusCode.NOT_FOUND)
          );
        }
  
        const response = sendSuccessApiResponse(
          "Blog retrieved successfully", 
          { blog }
        );
        res.status(StatusCode.OK).send(response);
      } catch (error) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );