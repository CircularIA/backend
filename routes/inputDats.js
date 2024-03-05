import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
//Controllers
import { getInputDats, getInputDatsByIndicator, registerInputDat, updateInputDat, updateInputDats, registerInputDatsMany } from '../controllers/inputDat.js';

router.get('/:branch', verifyToken, getInputDats);
router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', verifyToken, getInputDatsByIndicator);
//Post Routes
router.post('/:company/:branch', verifyToken, registerInputDat);
router.post('/many/:company/:branch', verifyToken, registerInputDatsMany);
//Patch Routes
router.patch('/update', verifyToken, updateInputDats);
router.patch('/update/:id', verifyToken, updateInputDat);

export default router;