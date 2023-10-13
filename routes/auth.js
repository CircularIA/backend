const router = require('express').Router();
const { User } = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    try {
        //console.log(req.body)
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send("User Doesn't exist");
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
            return res.status(401).send('Invalid email or password.');

        const { token, userId } = user.generateAuthToken();

        res.status(200).send({ data: { token, userId }, message: 'Login successful.' });

    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

const validate = (data) => {
    const Schema = Joi.object({
        email: Joi.string().required().email().label('Email'),
        password: Joi.string().required().label('Password'),
    });
    return Schema.validate(data);
}

module.exports = router;
