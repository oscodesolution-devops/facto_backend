import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";


router.route("/sendOtp").post(controllers.authController.sendOtp);
router.route("/verifyOtp").post(controllers.authController.verifyOtp);

export default router;