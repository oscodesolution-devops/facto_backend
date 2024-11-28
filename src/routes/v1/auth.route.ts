import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/signup").post(controllers.authController.signup);
router.route("/login").post(controllers.authController.login);

router.route("/sendOtp").post(controllers.authController.sendOtp);
router.route("/verifyOtp").post(controllers.authController.verifyOtp);

export default router;