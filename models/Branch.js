import { model, Schema } from "mongoose";
import Joi from 'joi';

const branchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    //Company of the branch
    //Nombre de sucursal
    name: { type: String, required: [true, 'Name is required'] },
    description: { type: String },
    address: { type: String },
    email: { type: String},
    //Persona responsable de la sucursal
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required'],
    },
    manager: {
        name: { type: String },
        email: { type: String },
        role: { type: String },
    },
    //Indicadores de la sucursal
    indicators: [{
        type: Schema.Types.ObjectId,
        ref: 'Indicators',
        sourceType: [{
            type: String
        }],
        active: { type: Boolean, default: true },
        activeRegisters: [{
            date: { type: Date }, //Fecha de activacion (año, mes, dia)
            value: { type: Boolean, default: true }, //Valor de activacion
            user: { //Usuario que activo el indicador
                name: { type: String },
                email: { type: String },
                role: { type: String },
            }
        }
        ],
    }],
    //Users assigned to the branch
    asignedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
})


//Methods of validate
branchSchema.statics.validateBranch = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        company: Joi.string().required().label('Company').messages({'string.empty': 'Company is required'}),
        description: Joi.string().label('Description'),
        address: Joi.string().label('Address'),
        email: Joi.string().email().label('Email'),
        manager: Joi.object({
            name: Joi.string().label('Manager name'),
            email: Joi.string().email().label('Manager email'),
        }),
        asignedUsers: Joi.array().items(Joi.string()).label('Asigned users'),
    });
    return Schema.validateAsync(id);
}

const Branch = model('Branch', branchSchema);

export default Branch;