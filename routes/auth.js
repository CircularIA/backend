import express from 'express';
const router = express.Router();
//Controller
import {login, logout, forgetPassword, resetPassword} from '../controllers/auth.js';
import verifyToken from '../middlewares/verifyToken.js';

router.post('/', login);
router.post('/logout', verifyToken, logout);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);

export default router;
