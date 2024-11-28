import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";

router.route("/").post(controllers.requestController.addRequest);

export default router;