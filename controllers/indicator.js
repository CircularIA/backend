const { Indicator } = require('../models/indicator');
const { InputDat } = require('../models/inputDat');
const mongoose = require('mongoose');

const getIndicators = async (req, res) => {
    try {
        //Se obtendra todos los indicadores
        const indicators = await Indicator.find();
        if (!indicators) return res.status(400).send({ message: 'Indicators not found' });
        return res.status(200).send({ indicators });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const getIndicatorValue = async (req, res) => {
    try {
        console.log(req.body)
        //Se obtendra todos los indicadores
        console.log("inputData modelo", InputDat)
        const {
            month,
            name,
        } = req.body;
        //Obtener los datos de entrada asociados al indicador
        const currentIndicator = await Indicator.find({name});
        if (!currentIndicator) return res.status(400).send({ message: 'Indicator not found' });
        console.log("currentIndicator", currentIndicator)
        //Definir rango de fechas
        const startDate = new Date(2021, month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(2021, month, 0, 23, 59, 59, 999);

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lte: endDate,
                    }
                }
            }
        ];

        //Obtener los valores de los input dats
        const inputDats = currentIndicator[0].inputDats;
        const inputDatsValues = [];
        console.log("inputdats", currentIndicator[0].inputDats)
        console.log("factors", currentIndicator[0].factors)
        for (const input of inputDats){
            const {code} = input;
            //Buscar solamente los datos de entrada de un mes especifico
            //Es decir, ocupando un rango de fechas
            console.log(await InputDat.find({code}))
            const inputDatValues = await InputDat.find({code}).aggregate(pipeline);
            inputDatsValues.push(inputDatValues);
        }
        //Obtener los valores de los factores
        const factorValue = currentIndicator[0].factors[0].value;
        //Calcular el valor del indicador
        if (currentIndicator.name === 'porcentaje de valorizacion ciclo biologico'){
            //Se debe obtener el valor del dato de entrada de
            //Entrada de residuos totales
            //Buscar en la variable inputDatsValues el valor del dato de entrada
            const valores = {
                entradaResiduosTotales: 0,
                generacionLodos: 0,
                valCompostaje: 0,
                valBiodigestion: 0,
                valTratamientoRiles: 0,
            }
            inputDatsValues.forEach((inputDat) => {
                if (inputDat.name === 'entrada residuos totales'){
                    valores['entradaResiduosTotales'] = inputDat.value
                } else if (inputDat.name === 'generacion lodos'){
                    valores['generacionLodos'] = inputDat.value;
                } else if (inputDat.name === 'val compostaje'){
                    valores['valCompostaje'] = inputDat.value;
                } else if (inputDat.name === 'val biodigestion'){
                    valores['valBiodigestion'] = inputDat.value;
                } else if (inputDat.name === 'val tratamiento riles'){
                    valores['valTratamientoRiles'] = inputDat.value;
                }
            })
            const valorizacionCicloBiologico = ((valores['valCompostaje'] + valores['valBiodigestion'] + valores['valTratamientoRiles']) * 100 ) / ((valores['entradaResiduosTotales'] * factorValue) / 100 );
            return res.status(200).send({valorizacionCicloBiologico});
        }

    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerIndicator = async (req, res) => {
    try {
        const {name, formula, source, categoria, sourceType, description, measurement, inputDats, factors } = req.body;
        //We need to check if the departament exist
        console.log(req.body)
        //Have to check if the indicator exist
        const indicatorExist = await Indicator.findOne({ name });
        if (indicatorExist) return res.status(400).send({ message: 'Indicator already exist' });
        //!Input dats will have a unique code
        //Input dats is a array of objects7
        //Each object have a name and a measurement
        //We have to check if the input data exist
        // value, date, measurement, company , branch
        console.log("inputDats", inputDats)
        for (const input of inputDats){
            const { name, measurement } = input;
            const inputDatExist = await InputDat.findOne({ name });
            //If the input data exist we have to check if the measurement is the same
            if (!inputDatExist){
                const newInputDat = new InputDat({
                    _id: new mongoose.Types.ObjectId(),
                    name,
                    measurement,
                })
                const result = await newInputDat.save();
                if (!result) return res.status(400).send({ message: 'Failed to register input data' });
                input.code = result.code;
            } else{
                if (inputDatExist.measurement !== measurement){
                    return res.status(400).send({message: 'Input data already exist but the measurement is different'})
                }
                input.code = inputDatExist.code;
            }
        }
        console.log("inputDats", inputDats  )
        const newIndicator = new Indicator({
            _id: new mongoose.Types.ObjectId(),
            name,
            formula,
            source,
            categoria,
            sourceType,
            description,
            measurement,
            inputDats,
            factors,
        });
        const result = await newIndicator.save();
        if (!result) return res.status(400).send({ message: 'Failed to register indicator' });
        return res.status(200).send({ message: 'Indicator registered' });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getIndicators,
    getIndicatorValue,
    registerIndicator,
}