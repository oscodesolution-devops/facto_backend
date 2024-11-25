import { controllers } from "@/controllers";
import express from "express";
const router = express.Router();


router.get('/',controllers.serviceController.getAllServices);


export default router;