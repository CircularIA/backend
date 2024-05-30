import express from "express";
const router = express.Router();

import {
	saveSelections,
    getSelections,
} from "../controllers/userSelections.js";
import verifyToken from "../middlewares/verifyToken.js";
import checkRole from "../middlewares/role-authorize.js";

// Route to save user selections
router.post("/:userId", verifyToken, saveSelections);
// Route to get user selections
router.get("/:userId", verifyToken, getSelections);

export default router;
