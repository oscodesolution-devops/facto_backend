import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";
import { isAdmin, verifyToken } from "@/middlewares/auth";
import {
  handleMulterError,
  processCourseMaterialsUpload,
  uploadCourseMaterials,
  uploadIcon,
} from "@/middlewares/upload";
import { processBlogContentUpload } from "@/middlewares/blogUpload";

router.post("/create", controllers.adminController.addAdmin);
router.post("/login", controllers.adminController.login);

router.post(
  "/add-employee",
  verifyToken,
  isAdmin,
  controllers.adminController.addEmployee
);
router.get(
  "/employees",
  verifyToken,
  isAdmin,
  controllers.adminController.getEmployee
);
router.get(
  "/employee/:userId",
  verifyToken,
  isAdmin,
  controllers.adminController.getUserById
);
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

router.post(
  "/courses",
  verifyToken,
  isAdmin,
  controllers.adminController.addCourse
);

router.get(
  "/courses",
  verifyToken,
  isAdmin,
  controllers.adminController.getCourses
);
router.get(
  "/courses/:id",
  verifyToken,
  isAdmin,
  controllers.adminController.getCourseById
);

router.post(
  "/courses/:courseId/lectures",
  verifyToken,
  isAdmin,
  processCourseMaterialsUpload,
  controllers.adminController.addLecture
);
router.get(
  "/courses/:courseId/lectures",
  verifyToken,
  isAdmin,
  controllers.adminController.getLecture
);
router.put(
  "/courses/:courseId/lectures/:lectureId",
  verifyToken,
  isAdmin,
  processCourseMaterialsUpload,
  controllers.adminController.updateLecture
);
router.patch(
  "/courses/:courseId/publish",
  verifyToken,
  isAdmin,
  controllers.adminController.publishCourse
);

router.put(
  "/courses/:courseId",
  verifyToken,
  isAdmin,
  controllers.adminController.updateCourse
);

router
  .route("/blogs")
  .post(
    verifyToken,
    isAdmin,
    processBlogContentUpload,
    controllers.adminController.createBlog
  )
  .get(verifyToken, isAdmin, controllers.adminController.ListBlogs);

router
  .route("/blogs/:id")
  .delete(verifyToken, isAdmin, controllers.adminController.deleteBlog)
  .put(
    verifyToken,
    isAdmin,
    processBlogContentUpload,
    controllers.adminController.updateBlog
  );
router
  .route("/query")
  .post(verifyToken, isAdmin, controllers.queryController.addQuery);

router
  .route("/query")
  .get(verifyToken, isAdmin, controllers.adminController.getQuery);

router
  .route("/query/:id")
  .put(verifyToken, isAdmin, controllers.adminController.addCommentToQuery);

router
  .route("/request")
  .get(verifyToken, isAdmin, controllers.adminController.getRequest);

router
  .route("/request")
  .post(verifyToken, isAdmin, controllers.requestController.addRequest);

router
  .route("/request/:id")
  .post(verifyToken, isAdmin, controllers.requestController.assignEmployee);

router
  .route("/quotation")
  .get(
    verifyToken,
    isAdmin,
    controllers.adminController.getAllQuotationRequests
  );
router
  .route("/quotation")
  .post(verifyToken, isAdmin, controllers.adminController.createAdminQuotation);

router
  .route("/quotation/:quotationId")
  .put(verifyToken, isAdmin, controllers.adminController.updateQuotationPrice);

router
  .route("/quotation/:userId")
  .get(
    verifyToken,
    isAdmin,
    controllers.adminController.findQuotationsByUserId
  );

router.put(
  "/applications/:applicationId",
  verifyToken,
  isAdmin,
  controllers.adminController.updateApplication
);
router.get(
  "/subservices/:subServiceId/applications",
  verifyToken,
  isAdmin,
  controllers.adminController.getAllApplicationsBySubService
);

export default router;
