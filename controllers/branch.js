const {Branch} = require('../models/Branch');
const { User} = require('../models/User');
const {Company} = require('../models/Company');
const {Departament} = require('../models/Departament');

const mongoose = require('mongoose');
const getBranch = async (req, res) => {
    try {
        //Depending of the user type and the user id, we have to return the branches
        //How this endpoint pass for the middle ware, we can obtain the user id
        const {user} = req;
        const findUser = await User.findById(user._id).populate('company').populate('departament');
        if (!findUser) return res.status(400).send({ message: 'User not found' });
        console.log("user", findUser)
        // *if user is type 0, return whole branch
        if (findUser.type === 0){
            const branches = await Branch.find();
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        } else if(findUser.type === 1){
            console.log("es tipo 1")
            // *This is a owner user, just return branch of the company associate it
            //The branches are associate with company atribute
            const dataCompany = await Company.findById(findUser.company._id).populate('branches');
            if (!dataCompany) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches: dataCompany.branches });
        } else{
            //*This is for restricted user, just return the branch associate with the departament
            //The departament is associate with the user
            const branches = await Branch.findById(findUser.departament.branch);
            if (!branches) return res.status(400).send({ message: 'Branch not found' });
            return res.status(200).send({ branches });
        }
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerBranch = async (req, res) => {
    try {
        const {name, description, address, email, manager, process, departament, company } = req.body;
        //We need to check if the departament exist
        const findDepartament = await Departament.findById(departament);
        if (!findDepartament) return res.status(400).send({ message: 'Departament not found ' });

        const branch = new Branch({
            _id: new mongoose.Types.ObjectId(),
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

const updateBranch = async (req, res) => {
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

const getIndicators = async (req, res) => {
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

module.exports = { getBranch, getIndicators, registerBranch, updateBranch };