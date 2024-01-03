import { Schema, model } from "mongoose";

import Joi from 'joi';

const InputdatSchema = new Schema({
    _id: Schema.Types.ObjectId,
    //Codigo que permitira identificar cada dato de entrada
    code: {type: Number},
    name: {type: String, required: [true, 'Name is required']},
    value: {type: Number, required: [true, 'Value is required']},
    date: {type: Date, default: Date.now},
    measurement: {type: String},
    indicator: {
        type: Schema.Types.ObjectId,
        ref: 'Indicator',
        required: [true, 'Indicator is required'],
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
    },
    //Usuario que registro el dato de entrada
    user: {
        name: {type: String},
        email: {type: String},
        role: {type: String},
    },
}, {timestamps: true})

//Middleware to generate the code before saving
InputdatSchema.pre('save', async function (next) {
    if (!this.code) {
        //Generate a unique code
        const lastInputDat = await InputDat.findOne().sort({field: 'asc', _id: -1}).limit(1);
        if (lastInputDat) {
            const lastcode = parseInt(lastInputDat.code, 10);
            this.code = (lastcode + 1).toString();
            next();
        } else {
            this.code = '1';
        }
    }
});
//Methods of validate
InputdatSchema.statics.validateInputDat = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        value: Joi.number().required().label('Value').messages({'number.empty': 'Value is required'}),
        date: Joi.date().label('Date'),
        measurement: Joi.string().label('Measurement'),
        indicator: Joi.string().required().label('Indicator').messages({'string.empty': 'Indicator is required'}),
        company: Joi.string().required().label('Company'),
        branch: Joi.string().required().label('Branch'),
        user: Joi.required().object({
            name: Joi.string().label('User name'),
            email: Joi.string().label('User email'),
            role: Joi.string().label('User role'),
        }),
    })
    return Schema.validate(id);
}

//Method to validate the code in register indicator
InputdatSchema.statics.validateFirstInputDat = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        measurement: Joi.string().label('Measurement'),
        indicator: Joi.string().required().label('Indicator').messages({'string.empty': 'Indicator is required'}),
    })
    return Schema.validate(id);
}



const InputDat = model('InputDat', InputdatSchema);

export default InputDat;