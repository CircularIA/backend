import { Schema, model } from 'mongoose';
import Joi from 'joi-oid';

const companySchema = new Schema({
    _id: Schema.Types.ObjectId,
    rut: {type: String, required: [true, 'Rut Company is required'], unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String},
    description: {type: String},
    //Gestion de residuos, bienes de consumo
    //retail, centro de distribuicion, transporte
    region: {type: String, required: true},
    address: {type: String, required: true},
    phone : {type: String},
    location: {
        type:{
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        }
    },
    //Size of the company
    size: {
        type: Number,
        integer: true
    },
    //Description of the company
    typeIndustry: {
        type: String,
        required: [true, 'Type Industry is required'],
        enum : ['Gestion de residuos', 'Bienes de consumo', 'Retail', 'Centro de distribuicion', 'Industrial manufactura', 'Valorizacion de residuos'],
    },
    //Quantity of employees
    employees: {type: Number, required: [true, 'Employees is required']},
    //Prioridades ambientales
    environmentalPrioritys: [{
        priority: {type: String},
    }],
    // *Tipo de maquinaria que posee la empresa
    typeMachinerys: [{
        machinery: {type: String},
    }],
    //*Proyectos de la compañia asociados a la economia circular
    proyectosECI: [{
        proyecto: {type: String},
    }],
    //Usuario dueño
    ownerUser: {
        ref: 'User',
        type: Schema.Types.ObjectId,
    },
    //Company branches
    branches: [{
        type: Schema.Types.ObjectId,
        ref: 'Branch',
    }],
})

//Methods of validate
companySchema.statics.validateCompany = async function (id) {
    const Schema = Joi.object({
        rut: Joi.string().required().label('Rut').messages({'string.empty': 'Rut is required'}),
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        email: Joi.string().required().label('Email').messages({'string.empty': 'Email is required'}),
        address: Joi.string().required().label('Address').messages({'string.empty': 'Address is required'}),
        region: Joi.string().required().label('Region').messages({'string.empty': 'Region is required'}),
        phone: Joi.string().label('Phone').messages({'string.empty': 'Phone is required'}),
        location: Joi.object().label('Location').messages({'string.empty': 'Location is required'}),
        size: Joi.number().label('Size').messages({'string.empty': 'Size is required'}),
        typeIndustry: Joi.string().required().label('Type Industry').messages({'string.empty': 'Type Industry is required'}),
        employees: Joi.number().required().label('Employees').messages({'string.empty': 'Employees is required'}),
    });
    return Schema.validateAsync(id);
}
//Method of validate update
companySchema.statics.validateUpdateCompany = async function (id) {
    const Schema = Joi.object({
        rut: Joi.string().min(8).max(10).label('Rut'),
        name: Joi.string().label('Name'),
        email: Joi.string().email().label('Email'),
        image: Joi.string().label('Image'),
        description: Joi.string().label('Description'),
        address: Joi.string().label('Address'),
        region: Joi.string().label('Region'),
        phone: Joi.string().label('Phone'),
        location: Joi.object().label('Location'),
        size: Joi.number().integer().label('Size'),
        typeIndustry: Joi.string().label('Type Industry'),
        employees: Joi.number().integer().label('Employees'),
        environmentalPrioritys: Joi.array().label('Environmental Prioritys'),
        typeMachinerys: Joi.array().label('Type Machinerys'),
        proyectosECI: Joi.array().label('Proyectos ECI'),
        branches: Joi.array().label('Branches'),
    });
    return Schema.validateAsync(id);
}

// Have to definy methods for specific functions
const Company = model('Company', companySchema);

export default Company;