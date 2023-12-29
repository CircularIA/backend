import express from 'express';
const router = express.Router();
//Controller
import {login, forgetPassword, resetPassword} from '../controllers/auth.js';

router.post('/', login);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);

export default router;
