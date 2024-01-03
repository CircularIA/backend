import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
//Controllers
import { getInputDats, getInputDatsByIndicator, registerInputDats, updateInputDat, updateInputDats, registerInputDatsMany } from '../controllers/inputDat.js';

router.get('/:branch', verifyToken, getInputDats);
router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', verifyToken, getInputDatsByIndicator);
//Post Routes
router.post('/', verifyToken, registerInputDats);
router.post('/many/:branch/:indicator', verifyToken, registerInputDatsMany);
//Patch Routes
router.patch('/update/:id', verifyToken, updateInputDat);
router.patch('/update', verifyToken, updateInputDats);

export default router;