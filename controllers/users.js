//Packages
import {Types } from 'mongoose';
import bcrypt from 'bcrypt';

//Models
import User from '../models/User.js';
import Company from '../models/Company.js';
import Branch from '../models/Branch.js';

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

//This is to create a user in the database with form register
export const createAdminUser = async (req, res) => {
    try {
        console.log(req.body);
        await User.validate(req.body);
        //Get the data
        const { username, email, password, company, role } = req.body;
        //Create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const result = await User.create({
            _id: new Types.ObjectId(),
            username,
            email,
            password: hashedPassword,
            company,
            role: 'Admin',
        });
        if (!result) res.status(400).send({ message: 'User not saved' });
        res.status(201).send('User created');
    } catch (error) {
        console.log("error", error)
        if (error.name === 'ValidationError') return res.status(400).send(error.message);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}
//Owner user is a user that have the type 1 and is the owner of the company
export const createOwnerUser = async (req, res) => {
    try {
        //Validate
        await User.validate(req.body);
        //Obtain the data
        const { username, email, password, company, role} = req.body;
        //Have to create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        //Obtain the company id
        const companyDats = await Company.findById(company);
        //Owner user can access to whole company data
        const newUser = new User({
            _id: new Types.ObjectId(),
            username,
            email,
            password: hashedPassword,
            company,
            role: 'Owner',
        });
        const result = await newUser.save();
        if (!result) res.status(400).send({ message: 'User not saved' });
        //Update the company owner user
        companyDats.ownerUser = result._id;
        await companyDats.save();
        return res.status(200).send({ message: 'User registered' });
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).send(error.message);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}

export const createRegularUser = async (req, res) => {
    try {
        //Validate 
        await User.validateRegularUser(req.body);
        //Obtain the data
        const { username, email, password, company, role, indicators, branches} = req.body;
        //Have to create a new user
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        //Obtain the company id
        const companyDats = await Company.findById(company).populate('branches').populate('indicators');
        //Filter the branches that belong to the company
        const branchesCompany = branches.filter(branch => companyDats.branches.includes(branch));
        //If the branches are not the same, throw an error
        if (branchesCompany.length === 0) return res.status(400).send({ message: 'Branches not found' });
        //If the indicators are not the same, throw an error
        const companyIndicatorsFiltered = companyDats.indicators.filter(indicator => indicators.includes(indicator._id.toString()));

        if (companyIndicatorsFiltered.length === 0 || companyDats.indicators.length === 0) return res.status(400).send({ message: 'Indicators not found' });
        //Have to add the meta data to array of indicators
        companyIndicatorsFiltered.map(indicator => {
            sourceType = indicator.sourceType;
            indicator.active = true;
            indicator.activeRegisters = [{
                date: new Date(),
                value: true,
                //!This have to be the user that give access to the indicator
                //!Obtained from the token of the request
                user: {
                    name: 'System',
                    email: 'email@gmail.com'
                }
            }];
        });
        //Regular 
        const newUser = new User({
            _id: new Types.ObjectId(),
            username,
            email,
            password: hashedPassword,
            company,
            role: 'Regular',
            indicators: indicatorsCompany,
            branches: branchesCompany,
        });
        const result = await newUser.save();
        if (!result) res.status(400).send({ message: 'User not saved' });
        
        //Update the asignedUsers of the branches
        branchesCompany.map(async branch => {
            const findBranch = await Branch.findById(branch);
            if (!findBranch) return res.status(400).send({ message: 'Branch not found' });
            findBranch.asignedUsers.push(result._id);
            await findBranch.save();
        });
        return res.status(200).send({ message: 'User registered' });
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).send(error.message);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}
