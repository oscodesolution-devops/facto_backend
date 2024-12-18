import express, { Router } from "express";
import routerV1 from "@/routes/v1";

const router: Router = express.Router();

router.use("/api/v1", routerV1);


export default router;