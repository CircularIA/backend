import express from 'express';
const router = express.Router();


import { getUser, createUser, createOwnerUser } from '../controllers/users.js';
import verifyToken from '../middlewares/verifyToken.js';
//Want to protect the get user endpoint

router.get('/', getUser);
router.post('/create', createUser);
router.post('/createOwner', createOwnerUser);

export default router;