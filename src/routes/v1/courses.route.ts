import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.route("/").get(controllers.courseController.getCourses);
router.route("/:courseId/lectures").get(controllers.courseController.getCourseById);
router.route("/my-courses").get(verifyToken,controllers.courseController.getYourCourses);


export default router;