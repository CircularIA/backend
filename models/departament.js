const mongoose = require('mongoose');
const { Schema } = mongoose;

const departamentSchema = new mongoose.Schema({
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
    ]
})

const Departament = mongoose.model('Departament', departamentSchema);

module.exports = { Departament };