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
	getEcoequivalences,
} from "../controllers/listInputDat.js";

// Specific routes first
// GET /ecoequivalences?subcategory=Salida y valorización de Residuos, Productos y subproductos&year=2024&branch=branchId
router.get("/ecoequivalences", verifyToken, getEcoequivalences);
router.get("/indicator/:indicatorId", verifyToken, getListInputDatsByIndicator);

// Generic routes after
router.get("/:branch?", verifyToken, getListInputDats);
router.post("/", verifyToken, createListInputDat);
router.patch("/:id", verifyToken, updateListInputDat);
router.delete("/:id", verifyToken, deleteListInputDat);

export default router;
