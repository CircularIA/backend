const mongoose = require('mongoose');
const {Schema} = mongoose;

const InputdatSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    //Codigo que permitira identificar cada dato de entrada
    code: {type: Number},
    name: {type: String},
    value: {type: Number},
    date: {type: Date},
    measurement: {type: String},
    indicator: {
        type: Schema.Types.ObjectId,
        ref: 'Indicator',
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
    },
}, {timestamps: true})

//The code attribute is generated automatically

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

const InputDat = mongoose.model('InputDat', InputdatSchema);

module.exports = {InputDat};