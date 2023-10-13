const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Company } = require('../models/company');

//This is to create a user in the database with form register
const createUser = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send('User already registered.');
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await new User({ ...req.body, password: hashedPassword, _id: new mongoose.Types.ObjectId() }).save();
        res.status(201).send('User created.');
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
//Owner user is a user that have the type 1 and is the owner of the company
const createOwnerUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            company,
        } = req.body;
        if (!fullName || !email || !password || !company) return res.status(400).send({ message: 'Incomplete data' });
        //Have to verify if the user already exist
        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send('User already registered.');
        //Have to create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        //Obtain the company id
        const companyDats = await Company.findOne({ rut: company });
        //Have to verify if the company exist
        if (!companyDats) return res.status(400).send({ message: 'Company not found' });
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            fullName,
            email,
            password: hashedPassword,
            company: companyDats._id,
            type: 1,
        });
        const result = await newUser.save();
        if (!result) return res.status(400).send({ message: 'Failed to register user' });
        return res.status(200).send({ message: 'User registered' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
module.exports = { createUser, createOwnerUser };