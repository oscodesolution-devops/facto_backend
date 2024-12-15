import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.route("/").post(verifyToken,controllers.applicationController.createApplication);
router.route("/").get(verifyToken,controllers.applicationController.getUserApplications);
router.route("/:subServiceId").get(verifyToken,controllers.applicationController.getApplicationBySubService);


export default router;