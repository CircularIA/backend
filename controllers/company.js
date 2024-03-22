//Packages
import { Types } from 'mongoose';

//Models
import Company from '../models/Company.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';

export const getCompany = async (req, res) => {
    try {
        const { user } = req;
        const findUser = await User.findById(user._id).populate('company');
        if (!findUser) return res.status(400).send({ message: 'User not found' });

        // *if user is type Admin, return whole branch
        if (findUser.role === 'Admin') {
            const companies = await Company.find({}).populate('branches')
            if (!companies) return res.status(400).send({ message: 'Companies not found' });
            return res.status(200).send({ companies });
        } else if (findUser.role === 'Owner') {
            const findCompany = await Company.findById(findUser.company._id).populate('branches');
            if (!findCompany) return res.status(400).send({ message: 'Company not found' });
            // *This user is a owner user, just return branch of the company associate it
            const dataCompany = await Company.findById(findUser.company._id).populate('branches');
            if (!dataCompany) return res.status(400).send({ message: 'Company not found' });
            return res.status(200).send({ companies: dataCompany });
        } else {
            // *This user just have access to branch asigned to a departament

        }
    } catch (error) {
        console.log("error", error)
        return res.status(500).send({ message: 'Internal Server Error' });
    }
}

export const registerCompany = async (req, res) => {
    try {
        //?Obtain the data
        const { rut, name, typeIndustry, address, region, location, size, employees, email, manager } = req.body;
        //?Validate the data of the company and throw an error if is not valid
        await Company.validateCompany({ rut, name, typeIndustry, address, region, location, size, employees, email });
        //Have to verify if the company already exist
        const company = await Company.findOne({ email });
        if (company) return res.status(400).send({ message: 'Company already exist' });
        //Create a new company
        const newCompany = new Company({
            _id: new Types.ObjectId(),
            rut: rut,
            name: name,
            typeIndustry: typeIndustry,
            address: address,
            region: region,
            location: location,
            size: size,
            employees: employees,
            email: email
        });

        const CompanySaved = await newCompany.save();
        if (!CompanySaved) return res.status(400).send({ message: 'Failed to register company' });

        let findManager = {}
        if (manager) {
            //We need to check if the manager exist
            findManager = await User.findById(manager);
            if (!findManager) return res.status(400).send({ message: 'Manager not found' });
        }

        const { user } = req;

        const initialBranch = new Branch({
            _id: new Types.ObjectId(),
            name: 'Principal',
            description: 'Sucursal principal',
            address,
            email,
            company: CompanySaved._id,
            manager: manager,
            assignedUsers: [user._id]
        })
        //Save the branch
        const branch = await initialBranch.save();
        if (!branch) return res.status(400).send({ message: 'Failed to register branch' });
        //Update the branches of the company
        CompanySaved.branches.push(branch._id);
        await CompanySaved.save();
        //Assosiate the branch to the company
        return res.status(200).send({ message: 'Company registered' });
    } catch (error) {
        console.log("error", error)
        //if error is validation error, send the error
        if (error.name === 'ValidationError') return res.status(400).send({ message: error.message });
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}

export const updatecompany = async (req, res) => {
    try {
        //Validate the data of the company and throw an error if is not valid
        await Company.validateUpdateCompany(req.body);

        const {
            rut,
            name,
            email,
            image,
            description,
            address,
            region,
            phone,
            location,
            size,
            typeIndustry,
            employees,
            environmentalPrioritys,
            typeMachinerys,
            proyectosECI,
            branches,
        } = req.body;
        //Obtain the id of the company
        const { id } = req.params;
        const company = await Company.findByIdAndUpdate(id, {
            rut,
            name,
            email,
            image,
            description,
            address,
            region,
            phone,
            location,
            size,
            typeIndustry,
            employees,
            environmentalPrioritys,
            typeMachinerys,
            proyectosECI,
            branches,
        })
        if (!company) return res.status(400).send({ message: 'Company not found' });
        return res.status(200).send({ message: 'Company updated' });
    } catch (error) {
        console.log("error", error)
        if (error.name === 'ValidationError') return res.status(400).send({ message: error.message });
        return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}

export const deleteCompany = async (req, res) => {
    const { id } = req.params; // ID de la compañía a eliminar

    try {
        // Encuentra la compañía por ID para obtener la lista de branches
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }

        // Extraer los IDs de las branches asociadas
        const branchIds = company.branches;

        // Eliminar sucursales de la colección "Branches"
        await Branch.deleteMany({ _id: { $in: branchIds } });

        // Finalmente, eliminar la compañía
        await Company.findByIdAndRemove(id);

        res.status(200).send({ message: 'Company and its branches have been deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
};
