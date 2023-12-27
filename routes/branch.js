const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken.js');

import { getBranch, getIndicators, registerBranch, updateBranch } from '../controllers/branch';

router.get('/', verifyToken, getBranch);
router.get('/indicators/:id', getIndicators);
router.post('/registerBranch', registerBranch);
router.put('/updateBranch', verifyToken, updateBranch);

export default router;