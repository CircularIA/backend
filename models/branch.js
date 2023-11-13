const mongoose = require('mongoose');
const { Schema } = mongoose;

const branchSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    //Codigo de sucursal
    code: { type: String, unique: true },
    //Nombre de sucursal
    name: { type: String },
    description: { type: String },
    address: { type: String },
    email: { type: String },
    manager: {
        name: { type: String },
        email: { type: String },
    },
    //Indicadores de la sucursal
    indicators: [{
        type: Schema.Types.ObjectId,
        ref: 'Indicator',
    }],
    //Departament of the branch
    departament: {
        type: Schema.Types.ObjectId,
        ref: 'Departament',
    },
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

const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Branch };