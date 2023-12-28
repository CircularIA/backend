//Packages
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

//Models
import User from '../models/User.js';
import Company from '../models/Company.js';

//This is to create a user in the database with form register
export const createUser = async (req, res) => {
    try {
        const { error } = User.validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        //Create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await new User({ ...req.body, password: hashedPassword, _id: new mongoose.Types.ObjectId() }).save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}
//Owner user is a user that have the type 1 and is the owner of the company
export const createOwnerUser = async (req, res) => {
    try {
        //Validate
        const { error } = User.validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        //Obtain the data
        const { fullName, email, password, company } = req.body;
        //Have to create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        //Obtain the company id
        const companyDats = await Company.findOne({ rut: company });
        //Owner user can access to whole company data
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            fullName,
            email,
            password: hashedPassword,
            company: companyDats._id,
            type: 1,
        });
        const result = await newUser.save();
        if (!result) throw new Error('Error creating user');
        return res.status(200).send({ message: 'User registered' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}
export const getUser = async (req, res) => {
    try {
        console.log("req",req.user)
        const user = await User.findById(req.user._id).populate('company');
        if (!user) return res.status(400).send({ message: 'User not found' });
        return res.status(200).send({ user });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}