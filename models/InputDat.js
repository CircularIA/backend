import { Schema, model } from "mongoose";

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

const InputDat = model('InputDat', InputdatSchema);

export default InputDat;