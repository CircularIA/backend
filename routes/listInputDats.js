import express from "express";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";

//Controllers
import {
	getListInputDats,
	createListInputDat,
	updateListInputDat,
	deleteListInputDat,
	getListInputDatsByIndicator,
} from "../controllers/listInputDat.js";

router.get("/:branch?", verifyToken, getListInputDats);
router.post("/", verifyToken, createListInputDat);
router.patch("/:id", verifyToken, updateListInputDat);
router.delete("/:id", verifyToken, deleteListInputDat);
router.get("/indicator/:indicatorId", verifyToken, getListInputDatsByIndicator);

export default router;
