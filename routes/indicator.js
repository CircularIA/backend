import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";
//Controllers
import {
	getIndicatorInfo,
	getIndicators,
	getIndicatorValue,
	registerIndicator,
	updateIndicator,
} from "../controllers/indicator.js";

//Get routes
router.get("/:indicator", verifyToken, getIndicatorInfo);
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
	checkRole(["Admin", "Owner"]),
	registerIndicator
);
//Patch routes
router.patch(
	"/update/:id",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	updateIndicator
);

export default router;
