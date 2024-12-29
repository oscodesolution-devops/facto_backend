import express, { Request, Response,NextFunction } from "express";
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
import { handleMulterError, uploadIcon } from "@/middlewares/upload";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";

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
router.post('/image', uploadIcon,bigPromise(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {console.log("ho")
    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the image URL from Cloudinary (available in req.file.path)
     res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    // Handle any errors that occurred during the file upload process
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
}));


router.get("/", (req: Request, res: Response) => {
  res.status(200).send({
    uptime: process.uptime(),
    message: "Shivam's API health check :: GOOD",
    timestamp: Date.now(),
  });
});

 export default router;