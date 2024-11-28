import express from "express";
const router = express.Router();

// import controllers
import { controllers } from "../../controllers";

router.route("/").post(controllers.queryController.addQuery);
// router.route("/:id").get(controllers.blogController.getBlogById);

export default router;