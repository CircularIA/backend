import { model, Schema } from "mongoose";
import Joi from 'joi';

const branchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    //Codigo de sucursal
    code: { type: String, unique: true },
    //Company of the branch
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required'],
    },
    //Nombre de sucursal
    name: { type: String, required: [true, 'Name is required'] },
    description: { type: String },
    address: { type: String },
    email: { type: String},
    //Persona responsable de la sucursal
    manager: {
        name: { type: String },
        email: { type: String },
    },
    //Indicadores de la sucursal
    indicators: [{
        type: Schema.Types.ObjectId,
        ref: 'Indicators',
        sourceType: { type: String },
        active: { type: Boolean, default: true },
        activeRegisters: {
            date: { type: Date }, //Fecha de activacion (año, mes, dia)
            value: { type: Boolean, default: true }, //Valor de activacion
            user: { //Usuario que activo el indicador
                name: { type: String },
                email: { type: String },
            }
        },
    }],
    //Users assigned to the branch
    asignedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
})

//Middleware para generar el codigo antes de guardar
branchSchema.pre('save', async function (next) {
    if (!this.code){
        //Genera un codigo unico
        const lastBranch = await Branch.findOne().sort({ field: 'asc', _id: -1 }).limit(1);
        if (lastBranch){
            const lastcode = parseInt(lastBranch.code, 10);
            this.code = (lastcode + 1).toString();
            next();
        } else{
            this.code = '1';
        }
    }
});

//Methods of validate
branchSchema.statics.validateBranch = async function (id) {
    const Schema = Joi.object({
        name: Joi.string().required().label('Name').messages({'string.empty': 'Name is required'}),
        company: Joi.string().required().label('Company'),
        description: Joi.string().label('Description'),
        address: Joi.string().label('Address'),
        email: Joi.string().email().label('Email'),
        manager: Joi.object({
            name: Joi.string().label('Manager name'),
            email: Joi.string().email().label('Manager email'),
        }),
        asignedUsers: Joi.array().items(Joi.string()).label('Asigned users'),
    })    
}

const Branch = model('Branch', branchSchema);

export default Branch;