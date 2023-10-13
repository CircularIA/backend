const router = require('express').Router();
const { User } = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const validateUser = async (req, res) => {
    try {
        const {error} = validate(req.body);
        if(error)
            return res.status(400).send(error.details[0].message);
        const user = await User.findOne({email: req.body.email});
        if (!user)
            return res.status(401).send('Invalid email or password.');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
            return res.status(401).send('Invalid email or password.');
        const token = user.generateAuthToken();

        // Configura la cookie segura con HttpOnly y Secure true al usar HTTPS
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send({ data: token, message: 'Login successful.' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}


const validate = (data) => {
    const Schema = Joi.object({
        email: Joi.string().required().email().label('Email'),
        password: Joi.string().required().label('Password'),
    });
    return Schema.validate(data);
}

module.exports = {validateUser};