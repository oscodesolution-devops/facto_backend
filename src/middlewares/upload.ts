import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request, Response, NextFunction } from "express";
import { createCustomError } from '@/errors/customAPIError';
import { StatusCode } from '@/constants/constants';
import { configDotenv } from 'dotenv';

configDotenv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'services', // folder name in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg'], // allowed formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional transformations
  }
});

// Create multer upload middleware
export const uploadIcon = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
}).single('icon'); 

export const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    if (!imageUrl || imageUrl === "http") return;
    
    // Extract public_id from Cloudinary URL
    const publicId = imageUrl
      .split('/')
      .slice(-1)[0]
      .split('.')[0];
      
    if (publicId) {
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};



export const handleMulterError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(createCustomError('File size is too large. Max size is 2MB', StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    if (error) {
      return next(createCustomError(error.message, StatusCode.BAD_REQ));
    }
    next();
  };