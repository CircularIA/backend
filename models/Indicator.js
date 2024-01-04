import { Schema, model } from 'mongoose';

import Joi from 'joi';

const IndicatorsSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, unique: true, required: true },
    source: { type: String, required: true }, //Fuente de donde se obtiene el indicador (CTI, Circulytics)
    //Definir como requerida la categoria
    categorie: {type: String, required: true}, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
    sourceType: { type: String }, //Tipo de fuente (Residuos, Flujos, Emisiones)
    description: { type: String }, //Descripcion del indicador
    measurement: { type: String }, //Unidad de medida del indicador
    inputDats: [{
        name: { type: String },
        measurement: { type: String },
    }],
    //Valores constantes que se utilizan en la formula
    // !Este atributo varia segun procesos segun el excel
    factors: [{
        name: { type: String },
        value: { type: Number },
        measurement: { type: String },
    }]  
}, {timestamps: true})

//Methods of validate
IndicatorsSchema.statics.validateIndicators = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        source: Joi.string().label('Source'),
        categorie: Joi.string().required().label('Categorie').messages({'string.empty': 'Categorie is required'}),
        sourceType: Joi.string().required().label('Source type'),
        description: Joi.string().label('Description'),
        measurement: Joi.string().label('Measurement'),
        inputDats: Joi.array().required().items(Joi.object({
            name: Joi.string().label('Name'),
            measurement: Joi.string().label('Measurement'),
        })).label('Input data'),
        factors: Joi.array().items(Joi.object({
            name: Joi.string().label('Name'),
            value: Joi.number().label('Value'),
            measurement: Joi.string().label('Measurement'),
        })).label('Factors'),
    })
    return Schema.validateAsync(id);
}

const Indicator = model('Indicator', IndicatorsSchema);

export default Indicator;