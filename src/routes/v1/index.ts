import express, { Request, Response, Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import notificationRoute from "./notification.route";
import serviceRoute from "./services.route";
import subServiceRoute from "./subServices.route";

const router: Router = express.Router();

router.use("/auth", authRoute);
router.use("/user",userRoute);
router.use("/admin",adminRoute);
router.use("/notification",notificationRoute);
router.use("/services",serviceRoute);
router.use("/sub-services",subServiceRoute);

router.get("/", (req: Request, res: Response) => {
  return res.status(200).send({
    uptime: process.uptime(),
    message: "Shivam's API health check :: GOOD",
    timestamp: Date.now(),
  });
});

 export default router;