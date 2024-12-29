import { Request, Response, NextFunction } from "express";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import bigPromise from "@/middlewares/bigPromise";
import { db } from "@/models";
import { AuthRequest } from "@/middlewares/auth";
// import { signup } from "./auth.controller";
import { ICourse, ILecture, IService, IUser } from "@/interfaces";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { INotification } from "@/interfaces/notificationInterface";
import {
  deleteCloudinaryImage,
  deleteUploadedFiles,
  processCourseMaterialsUpload,
} from "@/middlewares/upload";
export const getAllUsers = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await db.User.find({ role: "user" }).select("-password");

      const response = sendSuccessApiResponse("Users retrieved successfully", {
        users,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addUser = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use the existing signup controller
      // await signup(req, res, next);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addEmployee = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      // Use the existing signup controller
      // await signup(req, res, next);
      const employee = await db.User.findOne({ email });
      employee.role = "employee";

      await employee.save();

      // const response = sendSuccessApiResponse("Employee added successfully", {
      //   employee,
      // });
      // res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getEmployee = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employees = await db.User.find({ role: "employee" }).select(
        "-password"
      );

      const response = sendSuccessApiResponse(
        "Employees retrieved successfully",
        {
          employees,
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addAdmin = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
      }: IUser = req.body;

      if (
        !email ||
        !password ||
        !fullName ||
        !phoneNumber ||
        !aadharNumber ||
        !panNumber ||
        !dateOfBirth
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      const existingUser = await db.User.findOne({ email });
      if (existingUser) {
        return next(
          createCustomError(
            "This email is already registered.",
            StatusCode.BAD_REQ
          )
        );
      }

      // Hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin: IUser = await db.User.create({
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
        role: "admin",
        registrationDate: new Date(),
        lastLogin: null,
      });

      const adminResponse = newAdmin.toObject();
      delete adminResponse.password;

      const response = sendSuccessApiResponse(
        "Admin user created successfully",
        { admin: adminResponse }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const login = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          createCustomError(
            "Email and password are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Find user and explicitly select password
      const user = await db.User.findOne({ email, role: "admin" }).select(
        "+password"
      );

      if (!user) {
        return next(
          createCustomError("Invalid credentials", StatusCode.UNAUTH)
        );
      }

      // Compare password
      const isPasswordValid = password == user.password;

      if (!isPasswordValid) {
        return next(
          createCustomError("Invalid credentials", StatusCode.UNAUTH)
        );
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse("Login Successful!", {
        user: userResponse,
        token,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getUserById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findById(userId).select("-password");

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse(
        "User details retrieved successfully",
        { user }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteUserById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findByIdAndDelete(userId);

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse("User deleted successfully", {
        deletedUserId: userId,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editUserProfile = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const {
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
      }: Partial<IUser> = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findById(userId);

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      // Update user fields
      if (fullName) user.fullName = fullName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (aadharNumber) user.aadharNumber = aadharNumber;
      if (panNumber) user.panNumber = panNumber;
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
      if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;

      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      const response = sendSuccessApiResponse(
        "User profile updated successfully",
        { user: updatedUser }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content }: INotification = req.body;

      if (!title || !content) {
        return next(
          createCustomError(
            "Title and content are required",
            StatusCode.BAD_REQ
          )
        );
      }

      const notification = await db.Notification.create({ title, content });

      const response = sendSuccessApiResponse(
        "Notification created successfully",
        { notification }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return next(
          createCustomError("Invalid notification ID", StatusCode.BAD_REQ)
        );
      }

      const notification = await db.Notification.findByIdAndDelete(
        notificationId
      );

      if (!notification) {
        return next(
          createCustomError("Notification not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Notification deleted successfully",
        { deletedNotificationId: notificationId }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;
      const { title, content }: Partial<INotification> = req.body;

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return next(
          createCustomError("Invalid notification ID", StatusCode.BAD_REQ)
        );
      }

      const notification = await db.Notification.findById(notificationId);

      if (!notification) {
        return next(
          createCustomError("Notification not found", StatusCode.NOT_FOUND)
        );
      }

      if (title) notification.title = title;
      if (content) notification.content = content;

      await notification.save();

      const response = sendSuccessApiResponse(
        "Notification updated successfully",
        { notification }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, category }: IService = req.body;

      // Validate required fields
      if (!title || !description || !category) {
        return next(
          createCustomError(
            "Title and description are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Check if service with same title exists
      const existingService = await db.Service.findOne({ title });
      if (existingService) {
        return next(
          createCustomError(
            "Service with this title already exists",
            StatusCode.BAD_REQ
          )
        );
      }

      // Get icon URL from uploaded file
      const iconUrl = req.file ? req.file.path : "http"; // default value if no file uploaded

      // Create new service with icon
      const service = await db.Service.create({
        title,
        description,
        category,
        isActive: true,
        icon: iconUrl,
      });

      const response = sendSuccessApiResponse("Service created successfully", {
        service,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all services

// Get service by ID
export const getServiceById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Service retrieved successfully",
        {
          service,
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update service
export const updateService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;
      const { title, description, isActive, category }: Partial<IService> =
        req.body;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if new title already exists (excluding current service)
      if (title && title !== service.title) {
        const existingService = await db.Service.findOne({
          title,
          _id: { $ne: serviceId },
        });
        if (existingService) {
          return next(
            createCustomError(
              "Service with this title already exists",
              StatusCode.BAD_REQ
            )
          );
        }
      }

      // Handle icon upload if new file is provided
      if (req.file) {
        // Delete old icon from Cloudinary if it exists
        await deleteCloudinaryImage(service.icon);

        // Update with new icon URL
        service.icon = req.file.path;
      }

      // Update other service fields
      if (title) service.title = title;
      if (description) service.description = description;
      if (typeof isActive === "boolean") service.isActive = isActive;
      if (category) service.category = category;
      await service.save();

      const response = sendSuccessApiResponse("Service updated successfully", {
        service,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Delete service
export const deleteService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      // Check if service exists
      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if service has any associated subservices
      const hasSubServices = await db.SubService.exists({ serviceId });
      if (hasSubServices) {
        return next(
          createCustomError(
            "Cannot delete service with existing sub-services. Please delete all sub-services first.",
            StatusCode.BAD_REQ
          )
        );
      }

      // Delete the service
      await db.Service.findByIdAndDelete(serviceId);
      await deleteCloudinaryImage(service.icon);
      const response = sendSuccessApiResponse("Service deleted successfully", {
        deletedServiceId: serviceId,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle service status
export const toggleServiceStatus = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Toggle the isActive status
      service.isActive = !service.isActive;
      await service.save();

      const response = sendSuccessApiResponse(
        `Service ${
          service.isActive ? "activated" : "deactivated"
        } successfully`,
        { service }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;
      const { title, description, features, price, period, requests } =
        req.body;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.create({
        serviceId,
        title,
        description,
        requests,
        features,
        price,
        period,
      });

      const response = sendSuccessApiResponse(
        "SubService created successfully",
        { subService }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all SubServices

// Get a single SubService by ID

// Update a SubService
export const updateSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findByIdAndUpdate(
        subServiceId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "SubService updated successfully",
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Delete a SubService
export const deleteSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findByIdAndDelete(subServiceId);

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }
      await db.SubServiceRequirement.deleteMany({ subServiceId: subServiceId });

      const response = sendSuccessApiResponse(
        "SubService deleted successfully",
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle SubService status
export const toggleSubServiceStatus = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findById(subServiceId);

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }

      // Toggle the isActive status
      subService.isActive = !subService.isActive;
      await subService.save();

      const response = sendSuccessApiResponse(
        `SubService ${
          subService.isActive ? "activated" : "deactivated"
        } successfully`,
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const { title, description, isMandatory } = req.body;

      // Check if required fields are present
      if (!title) {
        return next(createCustomError("Title is required", StatusCode.BAD_REQ));
      }

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.create({
        subServiceId,
        title,
        description,
        isMandatory,
      });

      const response = sendSuccessApiResponse(
        "SubServiceRequirement created successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all SubServiceRequirements for a specific SubService

// Get a single SubServiceRequirement by ID
export const getSubServiceRequirementById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId, requirementId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(subServiceId) ||
        !mongoose.Types.ObjectId.isValid(requirementId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.findOne({
        _id: requirementId,
        subServiceId: subServiceId,
      });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement retrieved successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update a SubServiceRequirement
export const updateSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      // Check if at least one field to update is provided
      if (Object.keys(updateData).length === 0) {
        return next(
          createCustomError("No update data provided", StatusCode.BAD_REQ)
        );
      }

      // Ensure that subServiceId cannot be updated
      if (updateData.subServiceId) {
        delete updateData.subServiceId;
      }

      const subServiceRequirement =
        await db.SubServiceRequirement.findOneAndUpdate(
          { _id: requirementId },
          updateData,
          { new: true, runValidators: true }
        );

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement updated successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Delete a SubServiceRequirement
export const deleteSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement =
        await db.SubServiceRequirement.findOneAndDelete({
          _id: requirementId,
        });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement deleted successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle SubServiceRequirement mandatory status
export const toggleSubServiceRequirementMandatory = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.findOne({
        _id: requirementId,
      });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      // Toggle the isMandatory status
      subServiceRequirement.isMandatory = !subServiceRequirement.isMandatory;
      await subServiceRequirement.save();

      const response = sendSuccessApiResponse(
        `SubServiceRequirement is now ${
          subServiceRequirement.isMandatory ? "mandatory" : "optional"
        }`,
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
      }: ICourse = req.body;

      // Validate required fields
      if (
        !title ||
        !category ||
        !language ||
        !duration ||
        !price ||
        !description ||
        !totalLectures
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      // Check if course with same title exists
      const existingCourse = await db.Course.findOne({ title });
      if (existingCourse) {
        return next(
          createCustomError(
            "Course with this title already exists",
            StatusCode.BAD_REQ
          )
        );
      }

      // Create new course
      const course = await db.Course.create({
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
        lectures: [],
        status: "draft",
      });

      const response = sendSuccessApiResponse("Course created successfully", {
        course,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const updateCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params; // Assuming course ID is passed as a parameter
      const {
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
      }: Partial<ICourse> = req.body;

      // Check if the course exists
      const existingCourse = await db.Course.findById(courseId);
      if (!existingCourse) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Validate fields if provided
      if (title) {
        const duplicateTitle = await db.Course.findOne({
          title,
          _id: { $ne: courseId },
        });
        if (duplicateTitle) {
          return next(
            createCustomError(
              "Another course with this title already exists",
              StatusCode.BAD_REQ
            )
          );
        }
      }

      // Update course fields
      const updatedFields = {
        ...(title && { title }),
        ...(category && { category }),
        ...(language && { language }),
        ...(subtitleLanguage && { subtitleLanguage }),
        ...(duration && { duration }),
        ...(price && { price }),
        ...(description && { description }),
        ...(totalLectures && { totalLectures }),
      };

      const updatedCourse = await db.Course.findByIdAndUpdate(
        courseId,
        { $set: updatedFields },
        { new: true, runValidators: true }
      );

      const response = sendSuccessApiResponse("Course updated successfully", {
        course: updatedCourse,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getCourses = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await db.Course.find();
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
      const { id } = req.params;
      const course = await db.Course.findById(id).populate("lectures");
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
export const getLecture = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const courses = await db.Course.findById(courseId).populate("lectures");
      const response = sendSuccessApiResponse("Course Fetched Successfully", {
        lectures: courses.lectures,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addLecture = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let thumbnailUrl, videoUrl;
    try {
      try {
        req.body.duration = JSON.parse(req.body.duration);
        console.log(req.body.duration);
      } catch (parseError) {
        console.error("Error parsing duration:", parseError);
        return res.status(400).json({
          message: "Invalid duration format",
        });
      }
      const { courseId } = req.params;
      const {
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        isFree,
      }: ILecture = req.body;
      // console.log(req.body)
      // Validate required fields
      if (!title || !lectureNumber || !language || !courseLevel) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      thumbnailUrl = req.body.thumbnailUrl;
      videoUrl = req.body.videoUrl;

      if (!thumbnailUrl || !videoUrl) {
        return next(
          createCustomError(
            "Thumbnail and video are required",
            StatusCode.BAD_REQ
          )
        );
      }

      const lecture = await db.Lecture.create({
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        isFree,
      });

      course.lectures.push(lecture._id);
      course.totalLectures = course.lectures.length;
      await course.save();

      const response = sendSuccessApiResponse("Lecture added successfully", {
        lecture,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      await deleteUploadedFiles(thumbnailUrl, videoUrl);
      if (error.name === "ValidationError") {
        console.log(error);
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
export const updateLecture = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let updatedThumbnailUrl, updatedVideoUrl;
    try {
      const { courseId, lectureId } = req.params;
      const {
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        isFree,
      }: Partial<ILecture> = req.body;

      // Check if the course exists
      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if the lecture exists in the course
      const lecture = await db.Lecture.findById(lectureId);
      if (!lecture) {
        return next(
          createCustomError("Lecture not found", StatusCode.NOT_FOUND)
        );
      }

      // Handle file uploads
      updatedThumbnailUrl = req.body.thumbnailUrl || lecture.thumbnail;
      updatedVideoUrl = req.body.videoUrl || lecture.videoUrl;

      if (req.file) {
        if (req.file.fieldname === "thumbnail") {
          updatedThumbnailUrl = req.file.path;
        }
        if (req.file.fieldname === "video") {
          updatedVideoUrl = req.file.path;
        }
      }

      // Parse duration if provided
      if (req.body.duration) {
        try {
          req.body.duration = JSON.parse(req.body.duration);
          req.body.duration.value = Number(req.body.duration.value);
          console.log(req.body.duration);
        } catch (parseError) {
          console.error("Error parsing duration:", parseError);
          return res.status(400).json({
            message: "Invalid duration format",
          });
        }
      }

      // Update lecture fields
      lecture.title = title || lecture.title;
      lecture.subtitle = subtitle || lecture.subtitle;
      lecture.lectureNumber = lectureNumber || lecture.lectureNumber;
      lecture.language = language || lecture.language;
      lecture.subtitleLanguage = subtitleLanguage || lecture.subtitleLanguage;
      lecture.duration = req.body.duration || lecture.duration;
      lecture.courseLevel = courseLevel || lecture.courseLevel;
      lecture.thumbnail = updatedThumbnailUrl;
      lecture.videoUrl = updatedVideoUrl;
      lecture.isFree = isFree !== undefined ? isFree : lecture.isFree;

      // Save the updated lecture
      await lecture.save();

      const response = sendSuccessApiResponse("Lecture updated successfully", {
        lecture,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      // Clean up uploaded files in case of error
      if (req.file) {
        await deleteUploadedFiles(updatedThumbnailUrl, updatedVideoUrl);
      }
      if (error.name === "ValidationError") {
        console.error(error);
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const publishCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      // Check if course exists
      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if course has lectures
      if (course.lectures.length === 0) {
        return next(
          createCustomError(
            "Cannot publish a course without lectures",
            StatusCode.BAD_REQ
          )
        );
      }

      // Update course status to published
      course.status = "published";
      await course.save();

      const response = sendSuccessApiResponse("Course published successfully", {
        course,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createBlog = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        content,
        thumbnailUrl, // This will be populated by processCourseMaterialsUpload
        reference,
        tags,
      } = req.body;

      console.log(req.body);

      // Parse reference if it's a string
      const parsedReference =
        typeof reference === "string" ? JSON.parse(reference) : reference;

      // Validate required fields
      if (
        !title ||
        !content ||
        !thumbnailUrl ||
        !parsedReference ||
        !parsedReference.title ||
        !parsedReference.url
      ) {
        // Clean up any uploaded file if validation fails
        if (thumbnailUrl) {
          await deleteUploadedFiles(thumbnailUrl);
        }

        return next(
          createCustomError(
            "Title, content, image URL, and valid reference are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Create blog
      const blog = await db.Blog.create({
        title,
        content,
        imageUrl: thumbnailUrl, // Use the uploaded thumbnail URL
        reference: {
          title: parsedReference.title,
          url: parsedReference.url,
        },
        tags: tags ? JSON.parse(tags) : [],
      });

      const response = sendSuccessApiResponse("Blog created successfully", {
        blog,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error) {
      // Clean up any uploaded files in case of error
      if (req.body.thumbnailUrl) {
        await deleteUploadedFiles(req.body.thumbnailUrl);
      }
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const ListBlogs = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search = "", fromDate, toDate, page = 1, limit = 10 } = req.query;

      // Build filter
      const filter: any = {};

      // Text search on title
      if (search) {
        filter.$or = [{ title: { $regex: search, $options: "i" } }];
      }

      // Date range filtering
      if (fromDate && toDate) {
        filter.createdAt = {
          $gte: new Date(fromDate as string),
          $lte: new Date(toDate as string),
        };
      }

      // Pagination
      const options = {
        select: "title content createdAt imageUrl tags",
        sort: { createdAt: -1 },
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      };

      // Fetch blogs
      const blogs = await db.Blog.find(filter, null, options);
      const total = await db.Blog.countDocuments(filter);

      const response = sendSuccessApiResponse("Blogs retrieved successfully", {
        blogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalBlogs: total,
        },
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteBlog = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createCustomError("Invalid blog ID", StatusCode.BAD_REQ));
      }

      // Delete blog
      const deletedBlog = await db.Blog.findByIdAndDelete(id);

      if (!deletedBlog) {
        return next(createCustomError("Blog not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse("Blog deleted successfully", {
        deletedBlog,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queries = await db.Query.find().sort({ createdAt: -1 });
      const response = sendSuccessApiResponse(
        "Queries retrieved successfully",
        { queries }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addCommentToQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createCustomError("Invalid query ID", StatusCode.BAD_REQ));
      }
      if (!comment) {
        return next(
          createCustomError("Comment is required", StatusCode.BAD_REQ)
        );
      }

      const query = await db.Query.findById(id);

      query.comment = comment;
      await query.save();
      const response = sendSuccessApiResponse(
        "Comment added to the query successfully",
        { query }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getRequest = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = await db.Request.find().sort({ createdAt: -1 });
      const response = sendSuccessApiResponse("Requests fetched successfully", {
        requests,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getAllQuotationRequests = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {  page = 1, limit = 10 } = req.query;

      const query =  {};
      const skip = (Number(page) - 1) * Number(limit);

      const totalQuotations = await db.Quotation.countDocuments(query);
      const quotations = await db.Quotation.find(query)
        .populate('userId', 'fullName email')
        .populate('subServiceId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const response = sendSuccessApiResponse(
        "Quotation requests retrieved successfully", 
        {
          quotations,
          totalQuotations,
          page: Number(page),
          totalPages: Math.ceil(totalQuotations / Number(limit))
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);



export const updateQuotationPrice = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { quotationId } = req.params;
      const { totalPrice } = req.body;

      const updatedQuotation = await db.Quotation.findByIdAndUpdate(
        quotationId,
        {
          price:totalPrice,
        },
        { new: true, runValidators: true }
      );

      if (!updatedQuotation) {
        return next(
          createCustomError(
            "Quotation not found", 
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "Quotation updated successfully", 
        updatedQuotation
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const findQuotationsByUserId = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {userId} = req.params;
      const {  page = 1, limit = 10 } = req.query;

      const query = { userId };

      const skip = (Number(page) - 1) * Number(limit);

      const totalQuotations = await db.Quotation.countDocuments(query);
      const quotations = await db.Quotation.find(query)
        .populate('subServiceId', 'title description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const response = sendSuccessApiResponse(
        "User quotations retrieved successfully", 
        {
          quotations,
          totalQuotations,
          page: Number(page),
          totalPages: Math.ceil(totalQuotations / Number(limit))
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);


// controllers/applicationController.ts (add to existing file)

// Edit Application by ID
export const updateApplication = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;

      // Validate application ID
      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return next(
          createCustomError("Invalid Application ID", StatusCode.BAD_REQ)
        );
      }

      const {
        userDocuments = [],
        additionalNotes,
        requestedFeatures,
        status
      } = req.body;

      // Find the existing application
      const application = await db.Application.findOne({
        _id: applicationId
      });

      if (!application) {
        return next(
          createCustomError("Application not found", StatusCode.NOT_FOUND)
        );
      }

      // Validate user documents
      const validatedDocuments = await Promise.all(
        userDocuments.map(async (docId: string) => {
          const doc = await db.UserDocument.findOne({ 
            _id: docId, 
            // userId: userId,
            subServiceId: application.subServiceId
          });
          return doc ? doc._id : null;
        })
      );

      // Filter out null values
      const filteredDocuments = validatedDocuments.filter(doc => doc !== null);

      // Update application
      application.userDocuments = filteredDocuments;
      if (additionalNotes) application.additionalNotes = additionalNotes;
      if (requestedFeatures) application.requestedFeatures = requestedFeatures;
      
      // Only allow certain status changes
      const allowedStatusChanges = {
        draft: ['submitted'],
        submitted: ['draft']
      };

      if (status) {
        
        application.status = status;
      }

      await application.save();

      const response = sendSuccessApiResponse(
        "Application updated successfully",
        { 
          application,
          message: status 
            ? (status === 'submitted' 
              ? "Your application has been submitted for review" 
              : "Application draft saved")
            : "Application updated"
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get All Applications for a Specific SubService
export const getAllApplicationsBySubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const { 
        status, 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const subService = await db.SubService.findById(subServiceId);
      if (!subService) {
        return next(
          createCustomError("Invalid SubService", StatusCode.BAD_REQ)
        );
      }

      // Build query
      const query: any = { subServiceId };
      if (status) query.status = status;

      // Pagination and sorting
      const skipIndex = (Number(page) - 1) * Number(limit);
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Fetch applications with pagination and population
      const applications = await db.Application.find(query)
        .sort(sortOptions)
        .skip(skipIndex)
        .limit(Number(limit))
        .populate({
          path: 'userId',
          select: 'name email phone' // Select specific user fields
        })
        .populate({
          path: 'userDocuments',
          select: 'title documentType documentUrl'
        });

      // Count total matching documents
      const total = await db.Application.countDocuments(query);

      const response = sendSuccessApiResponse(
        "Applications retrieved successfully",
        { 
          applications,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
