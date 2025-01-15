import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
import { configDotenv } from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "services", // folder name in cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "svg","svg+xml"], // allowed formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // optional transformations
  } as any, // Bypass TypeScript checks
});


// Create multer upload middleware
export const uploadIcon = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."));
    }
  },
}).single("icon");

export const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    if (!imageUrl || imageUrl === "http") return;

    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

export const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        createCustomError("File size is too large.", StatusCode.BAD_REQ)
      );
    }
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  if (error) {
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  next();
};

const userDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_documents", // folder name in cloudinary for user documents
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"], // allowed formats for user documents
    resource_type: "raw", // allows for non-image file types
  } as any,
});

// Create multer upload middleware for user documents
export const uploadUserDocument = multer({
  storage: userDocumentStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB limit for user documents
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream"
    ];
    // console.log(file)
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Allowed types: JPG, PNG, PDF, DOC, DOCX")
      );
    }
  },
}).single("document");

export const deleteCloudinaryUserDocument = async (documentUrl: string) => {
  try {
    if (!documentUrl || documentUrl === "http") return;

    // Extract public_id from Cloudinary URL
    const publicId = documentUrl.split("/").slice(-1)[0].split(".")[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`user_documents/${publicId}`);
    }
  } catch (error) {
    console.error("Error deleting document from Cloudinary:", error);
  }
};

export const handleUserDocumentUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        createCustomError(
          "File size is too large. Max size is 10MB",
          StatusCode.BAD_REQ
        )
      );
    }
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  if (error) {
    return next(createCustomError(error.message, StatusCode.BAD_REQ));
  }
  next();
};

// Middleware to handle the file upload and add the URL to the request body
export const processUserDocumentUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadUserDocument(req, res, (error) => {
    if (error) {
      return handleUserDocumentUploadError(error, req, res, next);
    }

    if (req.file) {
      // Add the Cloudinary URL to the request body
      req.body.documentUrl = req.file.path;
    }

    next();
  });
};

const courseThumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course_thumbnails",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1280, height: 720, crop: "limit" }],
  } as any,
});

// Video Storage Configuration
const courseVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course_videos",
    allowed_formats: ["mp4", "mov", "avi"],
    resource_type: "video",
  } as any,
});

export const uploadCourseMaterials = multer({
  storage: multer.memoryStorage(), // Use memory storage to handle multiple files
  limits: {
    fileSize: 1024 * 1024 * 505, // 505MB limit to accommodate both thumbnail and video
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else if (
      file.fieldname === "video" &&
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
const isFileDictionary = (
  files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
): files is { [fieldname: string]: Express.Multer.File[] } => {
  return typeof files === "object" && !Array.isArray(files);
};

export const processCourseMaterialsUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadCourseMaterials(req, res, async (error) => {
    if (error) {
      return handleMulterError(error, req, res, next);
    }

    try {
      const uploadPromises = [];

      // Thumbnail Upload
      if (req.files && isFileDictionary(req.files) && req.files["thumbnail"]) {
        const thumbnailFile = (req.files as { [fieldname: string]: Express.Multer.File[] })["thumbnail"][0];
        
        const thumbnailUploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "course_thumbnails",
              transformation: [{ width: 1280, height: 720, crop: "limit" }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Write file buffer to stream
          uploadStream.end(thumbnailFile.buffer);
        });

        uploadPromises.push(
          thumbnailUploadPromise.then((result: any) => {
            req.body.thumbnailUrl = result.secure_url;
            console.log("hi",req.body.thumbnailUrl)
          })
        );
      }

      // Video Upload
      if (req.files&& isFileDictionary(req.files)  && req.files["video"]) {
        const videoFile = (req.files as { [fieldname: string]: Express.Multer.File[] })["video"][0];
        
        const videoUploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "course_videos",
              resource_type: "video",
              timeout: 180000 // 3 minutes timeout for video
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Write file buffer to stream
          uploadStream.end(videoFile.buffer);
        });

        uploadPromises.push(
          videoUploadPromise.then((result: any) => {
            req.body.videoUrl = result.secure_url;
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      next();
    } catch (uploadError) {
      await deleteUploadedFiles(req.body.thumbnailUrl, req.body.videoUrl);
      console.error("Upload error:", uploadError);
      return res.status(500).json({
        message: "Error uploading files",
        error: uploadError,
      });
    }
  });
};

export const deleteUploadedFiles = async (thumbnailUrl?: string, videoUrl?: string) => {
  try {
    // Delete thumbnail if uploaded
    if (thumbnailUrl) {
      const thumbnailPublicId = thumbnailUrl
        .split('/')
        .pop()
        ?.split('.')[0];
      
      if (thumbnailPublicId) {
        await cloudinary.uploader.destroy(`course_thumbnails/${thumbnailPublicId}`);
      }
    }

    // Delete video if uploaded
    if (videoUrl) {
      const videoPublicId = videoUrl
        .split('/')
        .pop()
        ?.split('.')[0];
      
      if (videoPublicId) {
        await cloudinary.uploader.destroy(`course_videos/${videoPublicId}`, { 
          resource_type: 'video' 
        });
      }
    }
  } catch (deleteError) {
    console.error('Error deleting uploaded files:', deleteError);
  }
};
