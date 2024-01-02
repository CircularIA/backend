//Packages
import {Types} from 'mongoose';

//Models
import  Branch  from '../models/Branch.js';
import  User  from '../models/User.js';
import  Company  from '../models/Company.js';

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
            // *This is a owner user, just return branch of the company associate it
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
        const {name, company, description, address, email, manager} = req.body;
        
        const branch = new Branch({
            _id: new Types.ObjectId(),
            name,
            description,
            address,
            email,
            manager,
            process,
            departament,
            company,
        });
        const savedBranch = await branch.save();
        if (!savedBranch) return res.status(400).send({ message: 'Branch not saved' });
        //Have to add the new branch to the departament
        findDepartament.assignedBranches.push(savedBranch._id);
        await findDepartament.save();
        //Have to add the new branch to the company
        const findCompany = await Company.findById(findDepartament.company);
        if (!findCompany) return res.status(400).send({ message: 'Company not found' });
        findCompany.branches.push(savedBranch._id);
        await findCompany.save();
        return res.status(200).send({ branch: savedBranch });
    } catch (error) {
        console.log("error", error)
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

export const getIndicators = async (req, res) => {
    try {
        const {id} = req.params;
        //We need to check if the branch exist
        const branch = await Branch.findById(id).populate('indicators');
        if (!branch) return res.status(400).send({ message: 'Branch not found' });
        return res.status(200).send({ indicators: branch.indicators });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
