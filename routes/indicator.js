import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";
//Controllers
import {
  getIndicators,
  getIndicatorValue,
  registerIndicator,
  updateIndicator,
  assignIndicator,
} from "../controllers/indicator.js";

//Get routes
router.get("/:branch?", verifyToken, getIndicators);
router.get(
  "/values/:branch/:indicator/:year/:month?",
  verifyToken,
  getIndicatorValue
);
//Post routes
router.post(
  "/register",
  verifyToken,
  checkRole("Admin", "Owner"),
  registerIndicator
);
//Patch routes
router.patch(
  "/update/:id",
  verifyToken,
  checkRole("Admin", "Owner"),
  updateIndicator
);
router.patch(
  "/assign",
  verifyToken,
  checkRole("Admin", "Owner"),
  assignIndicator
);

export default router;
