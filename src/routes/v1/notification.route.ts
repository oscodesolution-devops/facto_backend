import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/").get(controllers.notificationController.getAllNotifications);

export default router;