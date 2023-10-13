const { Company } = require('../models/company');
const { Branch } = require('../models/branch');
const mongoose = require('mongoose');

const registerCompany = async (req, res) => {
    try {
        const {
            rut,
            name,
            typeIndustry,
            address,
            employees,
            email,
        } = req.body;
        if (!rut || !name || !typeIndustry || !address || !employees || !email) return res.status(400).send({ message: 'Incomplete data' });
        //Have to verify if the company already exist
        const company = await Company.findOne({ email });
        if (company) return res.status(400).send({ message: 'Company already exist' });
        //Have to create a new standart branch
        const initialBranch = new Branch({
            _id: new mongoose.Types.ObjectId(),
            code: '000',
            name: 'Principal',
            description: 'Sucursal principal',
            address,
            email,
        })
        //Save the branch
        const branch = await initialBranch.save();
        if (!branch) return res.status(400).send({ message: 'Failed to register branch' });
        //Assosiate the branch to the company
        const newCompany = new Company({
            _id: new mongoose.Types.ObjectId(),
            rut,
            name,
            typeIndustry,
            address,
            employees,
            email,
            branches: [branch._id],
        });

        const result = await newCompany.save();
        if (!result) return res.status(400).send({ message: 'Failed to register company' });
        return res.status(200).send({ message: 'Company registered' });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { registerCompany };