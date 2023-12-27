import mongoose from "mongoose";
const {Schema} = mongoose;

const companySchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    rut: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
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
    //Culturizacion de empleados en aspectos de sostenibilidad 
    //Optimizacion de transporte
    //Reduccion de agua
    //Indicadores que calcula la empresa
    // ! ojo con esta definicion, aun falta definir la conexion con los indicadores
    indicators: [{
        name: {type: String},
        formula: {type: String},
        source: {type: String}, //Fuente de donde se obtiene el indicador (CTI, Circulytics)
        categorie: {type: String}, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
        sourceType: {type: String}, //Tipo de fuente (Flujos, Agua, Emisiones)
        description: {type: String}, //Descripcion del indicador
        measurement: {type: String}, //Unidad de medida del indicador
    }],
    //*Atributo que indique si la empresa tiene un departamento de innovacion y/o desarrollo
    innovationDepartament: {type: Boolean},
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

export default Company;