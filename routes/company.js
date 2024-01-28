import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";
//Controllers
import {
	getCompany,
	registerCompany,
	updatecompany,
} from "../controllers/company.js";

router.get("/", verifyToken, getCompany);
//Post Routes
router.post(
	"/registerCompany",
	verifyToken,
	checkRole("Admin"),
	registerCompany
);
//Put Routes (update totally the resouce or create)
//Patch Routes (update partially the resource)
router.patch(
	"/updateCompany/:id",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	updatecompany
);

export default router;
