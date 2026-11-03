import express from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { revokeCertificate, verifyCertificate } from "../controllers/certificateController.js";

const certificateRouter = express.Router();

// Public: anyone (employer, university) can check a certificate code.
certificateRouter.get("/verify/:code", verifyCertificate);
certificateRouter.put("/:code/revoke", protect, authorize("admin", "coordinator"), revokeCertificate);

export default certificateRouter;
