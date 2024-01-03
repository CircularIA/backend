import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
//Controllers
import { getBranch, registerBranch, updateBranch } from '../controllers/branch.js';

//Get Routes
router.get('/', verifyToken, getBranch);
//Post Routes
router.post('/registerBranch', verifyToken, checkRole('Admin', 'Owner'), registerBranch);
//Put Routes
router.put('/updateBranch', verifyToken, updateBranch);

export default router;