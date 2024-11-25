import { controllers } from "@/controllers";
import express from "express";
const router = express.Router();


router.get('/:serviceId',controllers.subServiceController.getAllSubServicesbyServiceId);


export default router;