const mongoose = require('mongoose');
const {Schema} = mongoose;

const companySchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    rut: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String},
    //Gestion de residuos, bienes de consumo
    //retail, centro de distribuicion, transporte
    //industrial y manufactura, valorizacion de residuos
    typeIndustry: {type: String, required: true},
    address: {type: String, required: true},
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
    //Quantity of employees
    employees: {type: Number, required: true},
    //Size of the company
    size: {type: String},
    //Type of machinery
    machinerys: [
        {
            machinery: {type: String},
            type: {type: String},
            quantity: {type: Number}
        }
    ],
    prioritys: {type: Array},
    //Description of the company
    description: {type: String},
    //Information that obtain of the company of the survey
    
    //Contact information
    contact: {type: String, required: false},
    //Projects of the company in the ECI
    proyectosECI: {type: Array},
    //Owner user
    ownerUser: {
        //Just need the email and name, no validate or passwords
        name: {type: String},
        email: {type: String},
    },
    //Company branches
    branches: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        }
    ],
    //Company departaments
    departaments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Departament',
        }
    ],
})

// Have to definy methods for specific functions

const Company = mongoose.model('Company', companySchema);

module.exports = {Company};

