import { Schema, model } from 'mongoose';

const companySchema = new Schema({
    _id: Schema.Types.ObjectId,
    rut: {type: String, required: [true, 'Rut Company is required'], unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String},
    //Gestion de residuos, bienes de consumo
    //retail, centro de distribuicion, transporte
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
    //Size of the company
    size: {type: String},
    //Description of the company
    description: {type: String},
    //Entrevista
    //gestion de residuos, bienes de consumo, retail, centro de distribuicion, industrial manufactura, valorizacion de residuos
    typeIndustry: {type: String, required: true},
    //Quantity of employees
    employees: {type: Number, required: true},
    //Prioridades ambientales
    environmentalPrioritys: [{
        priority: {type: String},
    }],
    //Reducir consumo del agua
    //Alcanzar y mantener estado de zero waste
    //Reducir huella de carbono 1er alcance
    //Reducir huella de carbono 2do alcance
    //Reducir huella de carbono 3er alcance
    //Ser reconocido como una empresa comprometida con la sostenibilidad
    // *Tipo de maquinaria que posee la empresa
    typeMachinerys: [{
        machinery: {type: String},
    }],
    //Camiones de transporte
    //Maquinaria que procesa residuos
    //Maquinaria con uso de gas 
    //Maquinarias refrigerantes
    //Vehiculos para uso de colaboradores
    //Gruas
    //Maquinaria de construccion
    //*Proyectos de la compañia asociados a la economia circular
    proyectosECI: [{
        proyecto: {type: String},
    }],
    //Usuario dueño
    ownerUser: {
        //Just need the email and name, no validate or passwords
        name: {type: String},
        email: {type: String},
    },
    //*Indicadores que calcula la empresa con la finalidad de tenerlos de manera general
    indicators: [{
        indicator:{
            type: Schema.Types.ObjectId,
            ref: 'Indicator',
        }, 
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        },
    }],
    //Company branches
    branches: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        }
    ],
})

// Have to definy methods for specific functions
const Company = model('Company', companySchema);

export default Company;