import { Schema, model } from "mongoose";

import Joi from 'joi';
import joiObjectId from 'joi-objectid';

const InputdatSchema = new Schema({
    _id: Schema.Types.ObjectId,
    //Name of the input data
    name: {type: String, required: [true, 'Name is required']},
    value: {type: Number, required: [true, 'Value is required']},
    date: {type: Date, default: new Date()},
    measurement: {type: String},
    indicator: {
        type: Schema.Types.ObjectId,
        ref: 'Indicator',
        required: [true, 'Indicator is required'],
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required'],
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch is required'],
    },
    //User that register the input data and is required
    user: {
        name: {type: String, required: [true, 'User name is required']},
        email: {type: String, required: [true, 'User email is required']},
        role: {type: String, required: [true, 'User role is required']},
    },
}, {timestamps: true})

//Methods of validate
InputdatSchema.statics.validateInputDat = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        value: Joi.number().required().label('Value').messages({'number.empty': 'Value is required'}),
        date: Joi.date().label('Date'),
        measurement: Joi.string().label('Measurement'),
        indicator: JoiWithObjectId.string().required().label('Indicator').messages({'string.empty': 'Indicator is required'}),
        company: JoiWithObjectId.string().required().label('Company').messages({'string.empty': 'Company is required'}),
        branch: JoiWithObjectId.string().required().label('Branch').messages({'string.empty': 'Branch is required'}),
        user: Joi.object({
            name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
            email: Joi.string().required().label('Email').messages({'string.empty': 'Email is required'}),
            role: Joi.string().required().label('Role').messages({'string.empty': 'Role is required'}),
        }).label('User').required().messages({'object.empty': 'User is required'
        })
    })
    return Schema.validateAsync(id);
}

//Method to validate the code in register indicator
InputdatSchema.statics.validateFirstInputDat = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        measurement: Joi.string().label('Measurement'),
    })
    return Schema.validateAsync(id);
}



const InputDat = model('InputDat', InputdatSchema);

export default InputDat;