import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/signup").post(controllers.authController.signup);
router.route("/login").post(controllers.authController.login);

export default router;