import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
 // Replace with your cloudinary configuration// Replace with your custom error utils

const isFileDictionary = (
  files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
): files is { [fieldname: string]: Express.Multer.File[] } => {
  return typeof files === "object" && !Array.isArray(files);
};

// Blog Storage Configuration
const blogStorage = multer.memoryStorage();

export const uploadBlogMaterials = multer({
  storage: blogStorage, // Memory storage to enable buffer handling
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/mkv"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WebM, MKV) are allowed."));
    }
  },
}).fields([
  { name: "thumbnail", maxCount: 1 }, // Single content file
]);

export const processBlogContentUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadBlogMaterials(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    console.log(req.file);
    try {
      if (!req.files || !isFileDictionary(req.files)) {
        throw createCustomError("No files were uploaded.", StatusCode.BAD_REQ);
      }

      const uploadPromises = [];
      const contentFile = req.files["thumbnail"]?.[0];

      if (contentFile) {
        const contentUploadPromise = new Promise((resolve, reject) => {
          const resourceType = contentFile.mimetype.startsWith("video") ? "video" : "image";

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "blogs",
              resource_type: resourceType,
              transformation: resourceType === "image" ? [{ width: 1280, height: 720, crop: "limit" }] : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Write file buffer to stream
          uploadStream.end(contentFile.buffer);
        });

        uploadPromises.push(
          contentUploadPromise.then((result: any) => {
            req.body.contentUrl = result.secure_url;
            req.body.contentType = contentFile.mimetype.startsWith("video") ? "video" : "image";
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      next();
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({
        message: "Error uploading blog content",
        error: uploadError.message || uploadError,
      });
    }
  });
};
