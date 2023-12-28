import { Schema, model } from 'mongoose';

const departamentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    code: { type: String },
    name: { type: String },
    description: { type: String },
    email: { type: String },
    //Sostenibilidad, Finanzas o RRHH
    category: { type: String, },
    manager: {
        name: { type: String },
        email: { type: String },
    },
    assignedBranches: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        }
    ],
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
})

const Departament = model('Departament', departamentSchema);

export default { Departament };