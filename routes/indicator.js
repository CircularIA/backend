import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
//Controllers
import { getIndicators, getIndicatorValue,  registerIndicator, assignIndicator } from '../controllers/indicator.js';

//Get routes
router.get('/', verifyToken, getIndicators);
router.get('/values/:branch/:indicator/:year/:month?', verifyToken, getIndicatorValue);
//Post routes
router.post('/register', verifyToken, checkRole('Admin', 'Owner'), registerIndicator);
//Patch routes
router.patch('/assign', verifyToken, checkRole('Admin', 'Owner'), assignIndicator);
//router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', getInputDatsByIndicator);

export default router;