import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";
import { processUserDocumentUpload } from "@/middlewares/upload";

router.route("/upload/:subServiceId").post(verifyToken,processUserDocumentUpload,controllers.userDocumentController.uploadDocument);
router.route("/remove/:documentId").delete(verifyToken,controllers.userDocumentController.removeDocument);

export default router;