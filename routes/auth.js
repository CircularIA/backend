const router = require('express').Router();
const { User } = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const {validateUser} = require('../controllers/auth');

router.post('/', validateUser);

module.exports = router;
