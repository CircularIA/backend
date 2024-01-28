import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";
//Controllers
import {
	getBranch,
	registerBranch,
	updateBranch,
} from "../controllers/branch.js";

//Get Routes
router.get("/", verifyToken, getBranch);
//Post Routes
router.post(
	"/register",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	registerBranch
);
//Patch Routes
router.patch(
	"/update/:id",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	updateBranch
);

export default router;
