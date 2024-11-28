import { controllers } from "@/controllers";
import express from "express";
const router = express.Router();


router.get('/:subServiceId',controllers.subServiceRequirementController.getAllSubServiceRequirements);



export default router;