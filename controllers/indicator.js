const { Indicator } = require('../models/indicator');
const {Branch} = require('../models/branch');
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
        console.log("entrada", req.body)
        //Se obtendra todos los indicadores
        const {
            year,
            month,
            name,
            branch, //Object id de la sucursal
        } = req.body;
        //Obtener los datos de entrada asociados al indicador
        const currentIndicator = await Indicator.findOne({ name });
        if (!currentIndicator) return res.status(400).send({ message: 'Indicator not found' });
        const branchExist = await Branch.findById(branch);
        if (!branchExist) return res.status(400).send({ message: 'Branch not found' });
        console.log("currentIndicator", currentIndicator)
        //Definir rango de fechas
        const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        //Obtener los valores de los input dats
        const inputDats = currentIndicator.inputDats;
        const inputDatsValues = [];
        for (const input of inputDats){
            const {code} = input;
            //Buscar solamente los datos de entrada de un mes especifico
            //Es decir, ocupando un rango de fechas
            const inputDatValues = await InputDat.aggregate([
                {
                    $match:{
                        date:{
                            $gte: startDate,
                            $lte: endDate,
                        },
                        code: code,
                        branch: branchExist._id,
                    }
                }
            ])
            console.log("input Dats Value", inputDatValues)
            inputDatsValues.push(inputDatValues);
        }
        //Obtener los valores de los factores
        //Calcular el valor del indicador
        
        if (currentIndicator.name === 'porcentaje de valorizacion ciclo biologico'){
            let factorValue = 0
            
            //Se debe obtener el valor del dato de entrada de
            //Entrada de residuos totales
            //Buscar en la variable inputDatsValues el valor del dato de entrada
            const valores = {
                entradaResiduosTotales: 0,
                generacionLodos: 0,
                valCompostaje: 0,
                valBiodigestion: 0,
                valTratamientoRiles: 0,
                potencialValorizacion: 0,
            }
            inputDatsValues.forEach((inputDat) => {
                console.log("inputDat", inputDat)
                if (inputDat[0].name === 'entrada residuos totales'){
                    valores['entradaResiduosTotales'] = inputDat[0].value
                } else if (inputDat[0].name === 'generacion lodos'){
                    valores['generacionLodos'] = inputDat[0].value;
                } else if (inputDat[0].name === 'val compostaje'){
                    valores['valCompostaje'] = inputDat[0].value;
                } else if (inputDat[0].name === 'val biodigestion'){
                    valores['valBiodigestion'] = inputDat[0].value;
                } else if (inputDat[0].name === 'val tratamiento riles'){
                    valores['valTratamientoRiles'] = inputDat[0].value;
                } else if (inputDat[0].name === 'potencial valorizacion ciclo biologico'){
                    valores['potencialValorizacion'] = inputDat[0].value;
                }
            })
            console.log("valores", valores)
            factorValue = (valores['potencialValorizacion'] / valores['entradaResiduosTotales'])*100;
            const valorizacionCicloBiologico = ((valores['valCompostaje'] + valores['valBiodigestion'] + valores['valTratamientoRiles']) * 100 ) / ((valores['entradaResiduosTotales'] * factorValue) / 100 );
            return res.status(200).send({valorizacionCicloBiologico});
        } else if (currentIndicator.name === 'porcentaje de valorizacion ciclo tecnico'){
            let factorValue = currentIndicator.factors[0].value;
            const valores = {
                entradaResiduos: 0,
                valPec: 0,
                potencialValorizacion: 0
            }
            inputDatsValues.forEach((inputDat) => {
                if (inputDat[0].name === 'entrada residuos'){
                    valores['entradaResiduos'] += inputDat[0].value
                } else if (inputDat[0].name === 'val pec'){
                    valores['valPec'] += inputDat[0].value;
                } else if (inputDat[0].name === 'potencial valorizacion ciclo tecnico'){
                    valores['potencialValorizacion'] += inputDat[0].value;
                }
            })
            //Retornar el valor junto con el factor
            factorValue = (valores['potencialValorizacion'] * 100) / (valores['entradaResiduos'])
            const porcentajeTecnico = ((valores['valPec']  * 100 ) / ((valores['entradaResiduos'] * factorValue) / 100 ));
            return res.status(200).send({porcentajeTecnico});
        } else{
            res.status(400).send({ message: 'Indicator not found' });
        }

    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerIndicator = async (req, res) => {
    try {
        const {name, formula, source, categorie, sourceType, description, measurement, inputDats, factors } = req.body;
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
            categorie,
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