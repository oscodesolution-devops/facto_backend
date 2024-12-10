import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.route("/").post(verifyToken,controllers.quotationController.createQuotation);
router.route("/").get(verifyToken,controllers.quotationController.getUserQuotations);

export default router;