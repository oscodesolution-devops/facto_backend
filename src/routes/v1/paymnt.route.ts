import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.route("/initiate-payment").post(verifyToken,controllers.paymentOrderController.initiatePayment);
router.route("/verify-payment").post(verifyToken,controllers.paymentOrderController.verifyPayment);
router.route("/razorpay-webhook").post(controllers.paymentOrderController.handleWebhook);

export default router;