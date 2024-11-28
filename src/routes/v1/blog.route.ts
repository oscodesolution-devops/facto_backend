import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/").get(controllers.blogController.getBlogs);
router.route("/:id").get(controllers.blogController.getBlogById);

export default router;