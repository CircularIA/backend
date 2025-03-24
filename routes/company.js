import express from "express";
import multer from "multer";
const router = express.Router();

import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";
//Controllers
import {
	getCompany,
	registerCompany,
	updatecompany,
	deleteCompany,
	uploadLogo
} from "../controllers/company.js";

// Almacenar temporalmente la imagen en memoria
const upload = multer({ dest: "uploads/" });

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
router.delete('/deleteCompany/:id', verifyToken, checkRole(['Admin']), deleteCompany);
// Post para subir imagen de la empresa
router.post(
	"/uploadLogo/:id",
	verifyToken,
	checkRole(["Admin", "Owner"]),
	upload.single("logo"),
	uploadLogo
  );

export default router;
