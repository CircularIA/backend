import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import { getCompany, registerCompany, updatecompany } from '../controllers/company.js';

router.get('/', verifyToken, getCompany);
router.post('/registerCompany', registerCompany);
router.put('/updateCompany', verifyToken, updatecompany);

export default router;