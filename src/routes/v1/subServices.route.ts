import { controllers } from "@/controllers";
import { verifyToken } from "@/middlewares/auth";
import express from "express";
const router = express.Router();


router.get('/service/:serviceId',controllers.subServiceController.getAllSubServicesbyServiceId);
router.get("/my-services",verifyToken,controllers.subServiceController.getYourServices);


export default router;