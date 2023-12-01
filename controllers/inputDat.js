const {InputDat} = require('../models/inputDat');
const {Branch} = require('../models/branch');
const {Indicator} = require('../models/indicator');
const mongoose = require('mongoose');

const getInputDats = async (req, res) => {
    try {
        const {branch} = req.params;
        const inputDats = await InputDat.find({branch});
        if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
        return res.status(200).send({ inputDats });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerInputDats = async (req, res) => {
    try {
        const {name, value, date, measurement, company , branch, indicator  } = req.body;
        //We need to check if the departament exist
        if (!company) return res.status(400).send({ message: 'Company is required' });
        if (!branch) return res.status(400).send({ message: 'Branch is required' });
        if (!indicator) return res.status(400).send({ message: 'Indicator is required' });
        const inputDat = new InputDat({
            _id: new mongoose.Types.ObjectId(),
            name,
            value,
            date,
            measurement,
            indicator,
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
        //Have to add the indicator to the branch
        const currentBranch = await Branch.findOne({ _id: branch });
        if (!currentBranch) return res.status(400).send({ message: 'Branch not found' });
        //Check if the indicator exist
        const currentIndicator = await Indicator.findOne({ _id: indicator });
        if (!currentIndicator) return res.status(400).send({ message: 'Indicator not found' });
        //Check if the indicator is already in the branch
        const indicatorExist = currentBranch.indicators.find(indicator => indicator.toString() === currentIndicator._id.toString());
        //Add the indicator to the branch
        if (!indicatorExist){
            currentBranch.indicators.push(currentIndicator._id);
            const savedBranch = await currentBranch.save();
            if (!savedBranch) return res.status(400).send({ message: 'Branch not saved' });
        }
        const savedInputDat = await inputDat.save();
        if (!savedInputDat) return res.status(400).send({ message: 'Input data not saved' });
        return res.status(200).send({ inputDat: savedInputDat });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const updateInputDat = async (req, res) => {
    try {
        //El formato sera un objeto
        const { id } = req.params;
        const { name, value, date, measurement } = req.body;
        const inputDat = await InputDat.findOne({ _id: id });
        if (!inputDat) return res.status(400).send({ message: 'Input data not found' });
        inputDat.name = name;
        inputDat.value = value;
        inputDat.date = date;
        inputDat.measurement = measurement;
        const savedInputDat = await inputDat.save();
        if (!savedInputDat) return res.status(400).send({ message: 'Input data not saved' });
        return res.status(200).send({ inputDat: savedInputDat });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const updateInputDats = async (req, res) => {
    try {
        //El formato sera un arreglo de objetos
        const { inputDats } = req.body;
        const promises = inputDats.map(async inputDat => {
            const { id, name, value, date, measurement } = inputDat;
            const currentInputDat = await InputDat.findOne({ _id: id });
            if (!currentInputDat) return res.status(400).send({ message: 'Input data not found' });
            if (currentInputDat.name !== name) return res.status(400).send({ message: 'Input data name can not be changed' });
            currentInputDat.name = name;
            currentInputDat.value = value;
            currentInputDat.date = date;
            currentInputDat.measurement = measurement;
            const savedInputDat = await currentInputDat.save();
            if (!savedInputDat) return res.status(400).send({ message: 'Input data not saved' });
        });
        await Promise.all(promises);
        return res.status(200).send({ message: 'Input data updated' });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { getInputDats, registerInputDats, updateInputDat, updateInputDats };