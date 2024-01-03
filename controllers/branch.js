//Packages
import {Types} from 'mongoose';

//Models
import  Branch  from '../models/Branch.js';
import  User  from '../models/User.js';
import  Company  from '../models/Company.js';
import Indicator from '../models/Indicator.js';

export const getBranch = async (req, res) => {
    try {
        //Depending of the user type and the user id, we have to return the branches
        const {user} = req;
        const findUser = await User.findById(user._id).populate('company');
        if (!findUser) return res.status(400).send({ message: 'User not found' });
        // *if user is admin, return all branches
        if (findUser.role === 'Admin'){
            const branches = await Branch.find();
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        } else if(findUser.role === 'Owner'){
            // *This is a owner user, just return branches of the company associate it
            //Check if the user is the owner of the company
            const companyUser = findUser.company;
            //Check if the current user match with the owner user of company
            if (user._id.toString() !== companyUser.ownerUser.toString()) return res.status(400).send({ message: 'User is not the owner' });
            //Find the company
            const dataCompany = await Company.findById(companyUser._id).populate('branches');
            if (!dataCompany) return res.status(400).send({ message: 'Company not found' });
            return res.status(200).send({ branches: dataCompany.branches});
        } else if(findUser.role === 'Regular'){
            //*This endpoint need to return the branches associate with the user 
            //Check if the user is included in the assignedUser of branch
            const branches = await Branch.find({asignedUsers: user._id});
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        } else {
            return res.status(400).send({ message: 'User type not found' });
        }
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}

export const registerBranch = async (req, res) => {
    try {
        //Validate
        await Branch.validateBranch(req.body);
        const {name, company, description, address, phone, email, manager, indicators, asignedUsers} = req.body;
        //Get User
        const {user} = req;
        const currentUser = await User.findById(user._id);
        //We need to check if the company exist
        const currentCompany = await Company.findById(company);
        if (!currentCompany) return res.status(400).send({ message: 'Company not found' });
        let findManager = {}
        //Check the manager
        if (manager){
            //We need to check if the manager exist
            findManager = await User.findById(manager);
            if (!findManager) return res.status(400).send({ message: 'Manager not found' });
        }
        let currentIndicators = [];
        //Check the Array of indicators if exist
        if (indicators){
            //We need to check if the indicators exist
            for (const indicator of indicators) {
                const findIndicator = await Indicator.findById(indicator);
                if (!findIndicator) return res.status(400).send({ message: 'Indicator not found' });
                currentIndicators.push({
                    type: findIndicator._id,
                    sourceType: findIndicator.sourceType,
                    active: true,
                    activeRegisters: [{
                        date: new Date(),
                        value: true,
                        user: {
                            name: currentUser.username,
                            email: currentUser.email,
                            role: currentUser.role,
                        }
                    }],
                });
            }
        }
        //Check the array of users if exist
        let currentUsers = [];
        if (asignedUsers){
            //We need to check if the users exist
            for (const user of asignedUsers) {
                const findUser = await User.findById(user);
                if (!findUser) return res.status(400).send({ message: 'User not found' });
                currentUsers.push(findUser._id);
            }
        }
        //Create a new branch
        const branch = new Branch({
            _id: new Types.ObjectId(),
            name,
            description,
            address,
            phone,
            email,
            company,
            manager: findManager,
            indicators: currentIndicators,
            asignedUsers: currentUsers,
        });
        const savedBranch = await branch.save();
        if (!savedBranch) return res.status(400).send({ message: 'Branch not saved' });
        //Have to add the new branch to the company
        currentCompany.branches.push(savedBranch._id);
        await currentCompany.save();
        return res.status(200).send({ branch: savedBranch, message: 'Branch saved' });
    } catch (error) {
        console.log("error", error)
        if (error.name === 'ValidationError') return res.status(400).send({ message: error.message });
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

export const updateBranch = async (req, res) => {
    try {
        const {name, description, address, email, manager, process, departament } = req.body;
        const {id} = req.params;
        //We need to check if the departament exist
        const findDepartament = await Departament.findById({code:departament});
        if (!findDepartament) return res.status(400).send({ message: 'Departament not found' });

        const branch = await Branch.findByIdAndUpdate(id, {
            name,
            description,
            address,
            email,
            manager,
            process,
            departament,
        });
        if (!branch) return res.status(400).send({ message: 'Branch not found' });
        return res.status(200).send({ branch });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}


