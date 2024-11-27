import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";
import { isAdmin, verifyToken } from "@/middlewares/auth";
import { deleteCourseThumbnail, handleMulterError, processCourseThumbnailUpload, processCourseVideoUpload, uploadCourseThumbnail, uploadCourseVideo, uploadIcon } from "@/middlewares/upload";

router.post("/create", controllers.adminController.addAdmin);
router.post("/login", controllers.adminController.login);

router.post(
  "/add-user",
  verifyToken,
  isAdmin,
  controllers.adminController.addUser
);
router.get(
  "/users",
  verifyToken,
  isAdmin,
  controllers.adminController.getAllUsers
);
router.get(
  "/users/:userId",
  verifyToken,
  isAdmin,
  controllers.adminController.getUserById
);
router.delete(
  "/users/:userId",
  verifyToken,
  isAdmin,
  controllers.adminController.deleteUserById
);
router.put(
  "/users/:userId",
  verifyToken,
  isAdmin,
  controllers.adminController.editUserProfile
);

router.get(
  "/notification",
  verifyToken,
  isAdmin,
  controllers.notificationController.getAllNotifications
);
router.post(
  "/notification",
  verifyToken,
  isAdmin,
  controllers.adminController.addNotification
);
router.put(
  "/notification/:notificationId",
  verifyToken,
  isAdmin,
  controllers.adminController.editNotification
);
router.delete(
  "/notification/:notificationId",
  verifyToken,
  isAdmin,
  controllers.adminController.deleteNotification
);

router.get(
  "/service",
  verifyToken,
  isAdmin,
  controllers.serviceController.getAllServices
);
router.post(
  "/service",
  verifyToken,
  isAdmin,
  (req, res, next) =>
    uploadIcon(req, res, (err) => handleMulterError(err, req, res, next)),
  controllers.adminController.addService
);
router.put(
  "/service/:serviceId",
  verifyToken,
  isAdmin,
  (req, res, next) =>
    uploadIcon(req, res, (err) => handleMulterError(err, req, res, next)),
  controllers.adminController.updateService
);
router.delete(
  "/service/:serviceId",
  verifyToken,
  isAdmin,
  controllers.adminController.deleteService
);
router.get(
  "/service/toggle/:serviceId",
  verifyToken,
  isAdmin,
  controllers.adminController.toggleServiceStatus
);

router.get(
  "/sub-services/:serviceId",
  verifyToken,
  isAdmin,
  controllers.subServiceController.getAllSubServicesbyServiceId
);
router.post(
  "/sub-service/:serviceId",
  verifyToken,
  isAdmin,
  controllers.adminController.createSubService
);
router.put(
  "/sub-service/:subServiceId",
  verifyToken,
  isAdmin,
  controllers.adminController.updateSubService
);
router.delete(
  "/sub-service/:subServiceId",
  verifyToken,
  isAdmin,
  controllers.adminController.deleteSubService
);
router.get(
  "/sub-service/toggle/:subServiceId",
  verifyToken,
  isAdmin,
  controllers.adminController.toggleSubServiceStatus
);

router.get(
  "/sub-services-requirement/:subServiceId",
  verifyToken,
  isAdmin,
  controllers.subServiceRequirementController.getAllSubServiceRequirements
);
router.post(
  "/sub-services-requirement/:subServiceId",
  verifyToken,
  isAdmin,
  controllers.adminController.createSubServiceRequirement
);
router.put(
  "/sub-services-requirement/:requirementId",
  verifyToken,
  isAdmin,
  controllers.adminController.updateSubServiceRequirement
);
router.delete(
  "/sub-services-requirement/:requirementId",
  verifyToken,
  isAdmin,
  controllers.adminController.deleteSubServiceRequirement
);
router.get(
  "/sub-services-requirement/toggle/:requirementId",
  verifyToken,
  isAdmin,
  controllers.adminController.toggleSubServiceRequirementMandatory
);

router.post("/courses", verifyToken,isAdmin , controllers.adminController.addCourse);
router.post(
  "/courses/:courseId/lectures",
  verifyToken,
  isAdmin,
  (req, res, next) => {
    // Use a combined middleware to handle both thumbnail and video uploads
    uploadCourseThumbnail(req, res, (thumbnailError) => {
      if (thumbnailError) {
        return handleMulterError(thumbnailError, req, res, next);
      }
      
      uploadCourseVideo(req, res, (videoError) => {
        if (videoError) {
          // If video upload fails, delete the already uploaded thumbnail if exists
          if (req.file) {
            deleteCourseThumbnail(req.file.path);
          }
          return handleMulterError(videoError, req, res, next);
        }
        
        // Add uploaded file paths to request body
        if (req.file) {
          if (req.file.fieldname === 'thumbnail') {
            req.body.thumbnailUrl = req.file.path;
          } else if (req.file.fieldname === 'video') {
            req.body.videoUrl = req.file.path;
          }
        }
        
        next();
      });
    });
  },
  controllers.adminController.addLecture,
);
router.patch(
  "/courses/:courseId/publish",
  verifyToken,
  isAdmin,
  controllers.adminController.publishCourse
);

export default router;
