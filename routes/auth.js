import express from 'express';
const router = express.Router();
//Controller
import {login} from '../controllers/auth.js';

router.post('/', login);

export default router;
