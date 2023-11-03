const {InputDat} = require('../models/inputDat');

const mongoose = require('mongoose');

const getInputDats = async (req, res) => {
    try {
        const {branch} = req.params;
        const inputDats = await InputDat.find();
        if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
        return res.status(200).send({ inputDats });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerInputDats = async (req, res) => {
    try {
        const {name, value, date, measurement, company , branch  } = req.body;
        //We need to check if the departament exist
        const inputDat = new InputDat({
            _id: new mongoose.Types.ObjectId(),
            name,
            value,
            date,
            measurement,
            company,
            branch,
        });
        const inputDatExist = await InputDat.findOne({ name });
        //If the input exits we have to check if the measurement is the same
        if (inputDatExist) {
            if (inputDatExist.measurement !== measurement) {
                return res.status(400).send({ message: 'Input data already exist but the measurement is different' })
            }
            //If the input dat exist, use the same code
            inputDat.code = inputDatExist.code;
        }
        const savedInputDat = await inputDat.save();
        if (!savedInputDat) return res.status(400).send({ message: 'Input data not saved' });
        return res.status(200).send({ inputDat: savedInputDat });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { getInputDats, registerInputDats };