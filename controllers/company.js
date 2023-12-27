import { Company } from '../models/Company';
import { Branch } from '../models/Branch';
import { User } from '../models/User';
import { Departament } from '../models/Departament';
import { Types } from 'mongoose';

export const registerCompany = async (req, res) => {
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
        //Have to create a new departament, by default, sostenibilidad
        const newDepartament = await new Departament({
            _id: new Types.ObjectId(),
            code: '000',
            name: 'Sostenibilidad',
            description: 'Departamento de sostenibilidad',
            email,
            category: 'Sostenibilidad',
        });
        //Save the departament
        const departament = await newDepartament.save();
        if (!departament) return res.status(400).send({ message: 'Failed to register departament' });
        //Have to create a new standart branch
        const initialBranch = new Branch({
            _id: new Types.ObjectId(),
            code: '000',
            name: 'Principal',
            description: 'Sucursal principal',
            address,
            email,
            departament: departament._id,
        })
        //Save the branch
        const branch = await initialBranch.save();
        if (!branch) return res.status(400).send({ message: 'Failed to register branch' });
        const updateDepartament = await Departament.findByIdAndUpdate(departament._id, { branch: branch._id });
        //Assosiate the branch to the company
        const newCompany = new Company({
            _id: new Types.ObjectId(),
            rut,
            name,
            typeIndustry,
            address,
            employees,
            email,
            branches: [branch._id],
            departaments: [departament._id],
        });

        const result = await newCompany.save();
        if (!result) return res.status(400).send({ message: 'Failed to register company' });
        return res.status(200).send({ message: 'Company registered' });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

export const getCompany = async (req, res) => {
    try {
        console.log("get company")
        const {user} = req;
        const findUser = await User.findById(user._id).populate('company');
        if (!findUser) return res.status(400).send({ message: 'User not found' });
        const findCompany = await Company.findById(findUser.company._id).populate('branches').populate('departaments');
        if (!findCompany) return res.status(400).send({ message: 'Company not found' });
        // *if user is type 0, return whole branch
        if (findUser.type === 0){
            const companies = await Company.find({}).populate('branches').populate('departaments');
            if (!companies) return res.status(400).send({ message: 'Companies not found' });
            return res.status(200).send({ companies });
        } else if(findUser.type === 1){
            // *This user is a owner user, just return branch of the company associate it
            const dataCompany = await Company.findById(findUser.company._id).populate('branches').populate('departaments');
            if (!dataCompany) return res.status(400).send({ message: 'Company not found' });
            return res.status(200).send({ companies: dataCompany });
        } else{
            // *This user just have access to branch asigned to a departament
            const departament = await Departament.findById(findUser.departament._id).populate('assignedBranches');
            if (!companies) return res.status(400).send({ message: 'Company not found' });
            return res.status(200).send({ companies: departament.assignedBranches });
        }
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({ message: 'Internal Server Error' });
    }
}

export const updatecompany = async (req,res) => {
    try {
        const {
            rut,
            image,
            size,
            description,
            employees,
            environmentalPrioritys,
            typeMachinerys,
            proyectosECI,
            innovationDepartament,
            branches,
            departaments
        } = req.body;
        //Have to update the value of the company
        //Using the rut
        // the goals is updated the values that are not null
        const company = await Company.findOneAndUpdate({rut}, {
            image,
            size,
            description,
            employees,
            environmentalPrioritys,
            typeMachinerys,
            proyectosECI,
            innovationDepartament,
            branches,
            departaments
        });
        if (!company) return res.status(400).send({ message: 'Company not found' });
        return res.status(200).send({ message: 'Company updated' });
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({ message: 'Internal Server Error' });
    }
}
