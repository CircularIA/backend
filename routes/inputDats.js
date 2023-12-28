import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';

//Controllers
import { getInputDats, getInputDatsByIndicator, registerInputDats, updateInputDat, updateInputDats, registerInputDatsMany } from '../controllers/inputDat.js';

router.get('/:branch', getInputDats);
router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', getInputDatsByIndicator);
router.post('/', registerInputDats);
router.post('/many/:branch/:indicator', registerInputDatsMany);
router.post('/update/:id', updateInputDat);
router.post('/update', updateInputDats);

export default router;