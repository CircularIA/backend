import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';

//Controllers
import { getBranch, getIndicators, registerBranch, updateBranch } from '../controllers/branch.js';

router.get('/', verifyToken, getBranch);
router.get('/indicators/:id', getIndicators);
router.post('/registerBranch', registerBranch);
router.put('/updateBranch', verifyToken, updateBranch);

export default router;