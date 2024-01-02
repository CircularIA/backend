import { Schema, model } from 'mongoose';

const IndicatorsSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, unique: true },
    source: { type: String }, //Fuente de donde se obtiene el indicador (CTI, Circulytics)
    //Definir como requerida la categoria
    categorie: {type: String, required: true}, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
    sourceType: { type: String }, //Tipo de fuente (Residuos, Flujos, Emisiones)
    description: { type: String }, //Descripcion del indicador
    measurement: { type: String }, //Unidad de medida del indicador
    inputDats: [{
        name: { type: String },
        code: {type: Number},
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

const Indicator = model('Indicators', IndicatorsSchema);

export default Indicator;