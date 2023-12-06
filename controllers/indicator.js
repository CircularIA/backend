const { Indicator } = require('../models/indicator');
const { Branch } = require('../models/branch');
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

const getValue = (name, inputDatsValues) => {
    //El objetivo de esta funcion es obtener el valor de un indicador con los valores de los input dats
    console.log("nombre indicador ", name)
    if (name === 'porcentaje de valorizacion ciclo biologico') {
        let factorValue = 0
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
            if (inputDat.name === 'entrada residuos totales') {
                valores['entradaResiduosTotales'] = inputDat.value
            } else if (inputDat.name === 'generacion lodos') {
                valores['generacionLodos'] = inputDat.value;
            } else if (inputDat.name === 'val compostaje') {
                valores['valCompostaje'] = inputDat.value;
            } else if (inputDat.name === 'val biodigestion') {
                valores['valBiodigestion'] = inputDat.value;
            } else if (inputDat.name === 'val tratamiento riles') {
                valores['valTratamientoRiles'] = inputDat.value;
            } else if (inputDat.name === 'potencial valorizacion ciclo biologico') {
                valores['potencialValorizacion'] = inputDat.value;
            }
        })
        factorValue = (valores['potencialValorizacion'] / valores['entradaResiduosTotales']) * 100;
        const valorizacionCicloBiologico = ((valores['valCompostaje'] + valores['valBiodigestion'] + valores['valTratamientoRiles']) * 100) / ((valores['entradaResiduosTotales'] * factorValue) / 100);
        return valorizacionCicloBiologico;
    } else if (name === 'porcentaje de valorizacion ciclo tecnico') {
        let factorValue = 0;
        const valores = {
            entradaResiduos: 0,
            valPec: 0,
            potencialValorizacion: 0
        }
        inputDatsValues.forEach((inputDat) => {
            if (inputDat.name === 'entrada residuos') {
                valores['entradaResiduos'] += inputDat.value
            } else if (inputDat.name === 'val pec') {
                valores['valPec'] += inputDat.value;
            } else if (inputDat.name === 'potencial valorizacion ciclo tecnico') {
                valores['potencialValorizacion'] += inputDat.value;
            }
        })
        //Retornar el valor junto con el factor
        factorValue = (valores['potencialValorizacion'] * 100) / (valores['entradaResiduos'])
        const porcentajeTecnico = ((valores['valPec'] * 100) / ((valores['entradaResiduos'] * factorValue) / 100));
        return porcentajeTecnico;
    }
}

const monthNumberToName = (monthNumber) => {
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return monthNames[monthNumber];
}
const getIndicatorValue = async (req, res) => {
    try {
        console.log("entrada", req.body)
        //Se obtendra todos los indicadores
        const branch = req.params.branch;
        const indicator = req.params.indicator;
        const currentIndicator = await Indicator.findById(indicator);
        if (!currentIndicator) return res.status(400).send({ message: 'Indicator not found' });
        const branchExist = await Branch.findById(branch);
        if (!branchExist) return res.status(400).send({ message: 'Branch not found' });
        const year = req.params.year;
        //Si no se indica el mes, se obtendra el valor del año
        let month = req.params.month;
        //Obtener los datos de entrada asociados al indicador
        if (!month) {
            console.log("no se ingreso el mes, se obtendra los valores del año: ", year)
            //Obtener los valores de los input dats del año
            const monthValues = [];
            //Explorar cada mes del año
            for (let i = 1; i <= 12; i++) {
                //Definir rango de fechas
                const startDate = new Date(year, i - 1, 1, 0, 0, 0, 0);
                const endDate = new Date(year, i, 0, 23, 59, 59, 999);
                const monthName = monthNumberToName(i - 1);
                //*Se define como valor por defecto negativo, si no se encuentra el valor del indicador
                const monthValue = {
                    month: monthName,
                    indice: i,
                    value: -1,
                }
                //Obtener los valores de los input dats usando el id del indicador y la sucursal
                const inputDatValues = await InputDat.aggregate([
                    {
                        $match: {
                            date: {
                                $gte: startDate,
                                $lte: endDate,
                            },
                            indicator: currentIndicator._id,
                            branch: branchExist._id,
                        }
                    }
                ])
                console.log("inputDatValues", inputDatValues)
                console.log("Del mes ", monthName, "se obtuvo ", inputDatValues.length, " valores")
                //Si no se encuentran valores, se retorna el valor por defecto
                if (inputDatValues.length === 0) {
                    monthValues.push(monthValue);
                    continue;
                } else {
                    //Si se encuentran valores, se calcula el valor del indicador
                    const value = getValue(currentIndicator.name, inputDatValues);
                    monthValue.value = value;
                    monthValues.push(monthValue);
                }
            }
            console.log("mont values", monthValues)
            return res.status(200).send({ monthValues });

        } else {
            month = parseInt(month);
            //Obtener los valores de los input dats del mes
            //Definir rango de fechas
            const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            //Obtener los valores de los input dats
            const inputDats = currentIndicator.inputDats;
            const inputDatsValues = await InputDat.aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        indicator: currentIndicator._id,
                        branch: branchExist._id,
                    }
                }
            ])
            //Obtener valor
            if (inputDatsValues.length === 0) {
                return res.status(200).send({ value: -1 });
            } else {
                const value = getValue(currentIndicator.name, inputDatsValues);
                return res.status(200).send({ value });
            }
        }
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

const registerIndicator = async (req, res) => {
    try {
        const { name, formula, source, categorie, sourceType, description, measurement, inputDats, factors } = req.body;
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
        for (const input of inputDats) {
            const { name, measurement } = input;
            const inputDatExist = await InputDat.findOne({ name });
            //If the input data exist we have to check if the measurement is the same
            if (!inputDatExist) {
                const newInputDat = new InputDat({
                    _id: new mongoose.Types.ObjectId(),
                    name,
                    measurement,
                })
                const result = await newInputDat.save();
                if (!result) return res.status(400).send({ message: 'Failed to register input data' });
                input.code = result.code;
            } else {
                if (inputDatExist.measurement !== measurement) {
                    return res.status(400).send({ message: 'Input data already exist but the measurement is different' })
                }
                input.code = inputDatExist.code;
            }
        }
        console.log("inputDats", inputDats)
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