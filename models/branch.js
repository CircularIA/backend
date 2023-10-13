const mongoose = require('mongoose');
const { Schema } = mongoose;

const branchSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    //Codigo de sucursal
    code: { type: String },
    //Nombre de sucursal
    name: { type: String },
    description: { type: String },
    address: { type: String },
    email: { type: String },
    manager: {
        name: { type: String },
        email: { type: String },
    },
    //Process of the branch
    process: [
        {
            name: { type: String },
            description: { type: String },
            //Type of process
        }
    ],
    //Departament of the branch
    departament: {
        code: { type: String },
        name: { type: String },
    },
})

const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Branch };