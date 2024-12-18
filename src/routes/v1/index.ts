import express, { Request, Response } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import notificationRoute from "./notification.route";
import serviceRoute from "./services.route";
import subServiceRoute from "./subServices.route";
import userDocumentRoute from "./userDocument.route";
import courseRoute from "./courses.route"
import blogRoute from "./blog.route"
import queryRoute from "./query.route"
import requestRoute from "./request.route"
import subServiceRequirementRoute from "./subServiceRequirement.route"
import paymentRoute from "./paymnt.route"
import quotationRoute from "./quotation.route"
import applicationRoute from "./applicationRoute"

const router = express.Router();

router.use("/auth", authRoute);
router.use("/user",userRoute);
router.use("/admin",adminRoute);
router.use("/notification",notificationRoute);
router.use("/services",serviceRoute);
router.use("/sub-services",subServiceRoute);
router.use("/document",userDocumentRoute);
router.use("/course",courseRoute);
router.use("/blogs",blogRoute);
router.use("/query", queryRoute);
router.use("/request", requestRoute);
router.use("/requirements",subServiceRequirementRoute);
router.use("/payment",paymentRoute);
router.use("/quotation",quotationRoute);
router.use("/application",applicationRoute);


router.get("/", (req: Request, res: Response) => {
  res.status(200).send({
    uptime: process.uptime(),
    message: "Shivam's API health check :: GOOD",
    timestamp: Date.now(),
  });
});

 export default router;