import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
//Controllers
import { getIndicators, getIndicatorValue,  registerIndicator } from '../controllers/indicator.js';

router.get('/', getIndicators);
router.get('/values/:branch/:indicator/:year/:month?', getIndicatorValue);
router.post('/', registerIndicator);
//router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', getInputDatsByIndicator);

export default router;