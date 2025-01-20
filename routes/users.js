import express from "express";
const router = express.Router();

import {
	getUser,
	getUsersByBranch,
	createAdminUser,
	createOwnerUser,
	createRegularUser,
} from "../controllers/users.js";
import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";

//Get Routes
router.get("/:id", verifyToken, getUser);
router.get("/byBranch/:id", verifyToken, getUsersByBranch);
//Post Routes
router.post("/createAdmin", createAdminUser);
router.post("/createOwner", verifyToken, checkRole("Admin"), createOwnerUser);
router.post(
	"/createRegular",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	createRegularUser
);

export default router;
