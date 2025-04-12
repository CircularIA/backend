import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
//Controllers
import { getInputDats, getInputDatsByIndicator, registerInputDat, updateInputDat, updateInputDats, registerInputDatsMany, importInputDats, getImportProgress, checkExistingInputDats } from '../controllers/inputDat.js';

// Rutas específicas primero
router.get('/import/progress', verifyToken, getImportProgress);
router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', verifyToken, getInputDatsByIndicator);

//Post Routes
router.post('/verify/:company/:branch', verifyToken, checkExistingInputDats);
router.post('/import/:company/:branch', verifyToken, importInputDats);
router.post('/many/:company/:branch', verifyToken, registerInputDatsMany);
router.post('/:company/:branch', verifyToken, registerInputDat);

//Patch Routes
router.patch('/update', verifyToken, updateInputDats);
router.patch('/update/:id', verifyToken, updateInputDat);

// Ruta genérica al final
router.get('/:branch/:year?/:month?/:day?', verifyToken, getInputDats);

export default router;