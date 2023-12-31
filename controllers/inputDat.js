import { Types, startSession } from 'mongoose';

//Models
import  InputDat  from '../models/InputDat.js';
import  Branch  from '../models/Branch.js';
import  Indicator  from '../models/Indicator.js';
import User  from '../models/User.js';

export const getInputDats = async (req, res) => {
    try {
        const { branch } = req.params;
        const inputDats = await InputDat.find({ branch });
        if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
        return res.status(200).send({ inputDats });
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
//Hay que definir 4 casos para este endpoint
//Si no se recibe fecha, obtener todos los datos historicos
//Si se recibe el año, obtener todos los datos del año
//Si se recibe el año y el mes, obtener todos los datos del mes
//Si se recibe el año, el mes y el dia, obtener todos los datos del dia
export const getInputDatsByIndicator = async (req, res) => {
    try {
        await InputDat.validateGetInputDatsByIndicator(req.params);
        //Obtener los input dats de un indicador en una fecha
        const branch = req.params.branch;
        const indicator = req.params.indicator;
        //*El formato es year, month, day
        let year = req.params.year;
        let month = req.params.month;
        let day = req.params.day;
        //const date = req.params.date || new Date().toISOString().split('T')[0];
        if (!indicator) return res.status(400).send({ message: 'Indicator is required' });
        if (!branch) return res.status(400).send({ message: 'Branch is required' });
        const currentIndicator = await Indicator.findById(indicator);
        //Check if the indicator is assigned to the branch
        const currentBranch = await Branch.findById(branch);
        if (!currentBranch) return res.status(400).send({ message: 'Branch not found' });
        const indicatorExist = currentBranch.indicators.find(
            item => item.indicator.toString() === currentIndicator._id.toString()
        );
        if (!indicatorExist) return res.status(400).send({ message: 'Indicator not assigned to the branch' });
        //Check if the indicator is active on the branch
        if (!indicatorExist.active) return res.status(400).send({ message: 'Indicator is not active on the branch' });
        // const dateSplitted = date.split('-');
        if (!year){
            //Obtener todos los datos historicos
            const inputDats = await InputDat.aggregate([
                {
                    $match: {
                        indicator: new Types.ObjectId(indicator),
                        branch: new Types.ObjectId(branch),
                    }
                }
            ])    
            if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
            return res.status(200).send({ inputDats });
        } else if (!month){
            //Obtener todos los datos del año
            year = parseInt(year);
            const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
            const inputDats = await InputDat.aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        indicator: new Types.ObjectId(indicator),
                        branch: new Types.ObjectId(branch),
                    }
                }
            ])
            if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
            return res.status(200).send({ inputDats });
        } else if (!day){
            //Obtener todos los datos de un mes
            year = parseInt(year);
            month = parseInt(month);
            const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            const inputDats = await InputDat.aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        indicator: new Types.ObjectId(indicator),
                        branch: new Types.ObjectId(branch),
                    }
                }
            ])
            if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
            return res.status(200).send({ inputDats });
        } else {
            //Obtener todos los datos de un dia
            year = parseInt(year);
            month = parseInt(month);
            day = parseInt(day);
            const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
            const inputDats = await InputDat.aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        indicator: new Types.ObjectId(indicator),
                        branch: new Types.ObjectId(branch),
                    }
                }
            ])
            if (!inputDats) return res.status(400).send({ message: 'Input data not found' });
            return res.status(200).send({ inputDats });
        }
    } catch (error) {
        console.log("error", error)
        if (error.isJoi) return res.status(400).send({ message: error.message });
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
export const registerInputDats = async (req, res) => {
    try {
        const { name, value, date, measurement, company, branch, indicator } = req.body;
        //We need to check if the departament exist
        if (!company) return res.status(400).send({ message: 'Company is required' });
        if (!branch) return res.status(400).send({ message: 'Branch is required' });
        if (!indicator) return res.status(400).send({ message: 'Indicator is required' });
        const inputDat = new InputDat({
            _id: new Types.ObjectId(),
            name,
            value,
            date,
            measurement,
            indicator,
            company,
            branch,
        });
        //! Probar como funciona esta validacion
        //Validate the input dat values using schema validator of mongoose
        const validationError = inputDat.validateSync();
        if (validationError) return res.status(400).send({ message: validationError.message });
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
        if (!indicatorExist) {
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

//Endpoint para registrar varios datos de entrada
export const registerInputDatsMany = async (req, res) => {
    //const { name, value, date, measurement, company, branch, indicator } = req.body;
    //Hay valores que son generales, como la compañia, la sucursal y el indicador
    const {
        branch,
        indicator
    } = req.params;
    const {
        inputDats
    } = req.body;
    //Verif icar que la compañia, sucursal  y el indicador exista
    const currentBranch = await Branch.findOne({ _id: branch });
    if (!currentBranch) return res.status(400).send({ message: 'Branch not found' });
    //Check if the indicator exist
    const currentIndicator = await Indicator.findOne({ _id: indicator });
    if (!currentIndicator) return res.status(400).send({ message: 'Indicator not found' });
    //Check if the indicator is assigned to the branch
    const indicatorExist = currentBranch.indicators.find(
        item => item.indicator.toString() === currentIndicator._id.toString()
    );
    if (!indicatorExist) return res.status(400).send({ message: 'Indicator not assigned to the branch' });
    //Check if the indicator is active on the branch
    if (!indicatorExist.active) return res.status(400).send({ message: 'Indicator is not active on the branch' });
    //Obtener usuario
    const user = await User.findOne({ _id: req.user._id });
    if (!user) return res.status(400).send({ message: 'User not found' });
    //Iniciar la transacción de mongo
    const session = await startSession();
    
    try {
        await session.withTransaction(async () => {
            //Verificar si el indicador ya esta en la sucursal
            if(!currentBranch.indicators.includes(currentIndicator._id)){
                currentBranch.indicators.push(currentIndicator._id);
                await currentBranch.save({session});
            }
            //Crear los input dats
            for (const inputDat of inputDats) {
                inputDat.indicator = indicator;
                inputDat.company = currentBranch.company;
                inputDat.branch = branch;
                inputDat.user = {
                    name: user.username,
                    email: user.email,
                    role: user.role,
                }
                //Validate the input dat values using schema validator of mongoose
                await InputDat.validateInputDat(inputDat);
                const { name, value, date, measurement } = inputDat;

                const existingInputDats = await InputDat.findOne({ name, branch, indicator }).session(session);
                //Verificar si la medida es la misma
                if (existingInputDats && existingInputDats.measurement !== measurement) {
                    throw new Error('Input data already exist but the measurement is different');
                }


                const newInputDat = new InputDat({
                    _id: new Types.ObjectId(),
                    ...inputDat,
                })
                await newInputDat.save({session});
            }
        });

        res.status(200).send({message: 'Input data saved'});
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ message: 'Internal Server Error', error:error.message });
    } finally {
        session.endSession();
    }
}

export const updateInputDat = async (req, res) => {
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

export const updateInputDats = async (req, res) => {
    try {
        //El formato sera un arreglo de objetos
        const { inputDats } = req.body;
        //User
        const user = await User.findOne({ _id: req.user._id });
        if (!user) return res.status(400).send({ message: 'User not found' });

        const promises = inputDats.map(async inputDat => {
            //Validate the input dat values using schema validator of mongoose
            await InputDat.validateInputDat(inputDat);
            const {id, name, value, date, measurement } = inputDat;
            //Define using findOneAndUpdate
            const result = await InputDat.findOneAndUpdate({
                _id: id,
            }, {
                value,
                date,
                measurement,
                user: {
                    name: user.username,
                    email: user.email,
                    role: user.role,
                }
            }, {
                new: true,
            });
            if (!result) throw new Error('Input data not found or not updated');
        });
        await Promise.all(promises);
        return res.status(200).send({ message: 'Input data updated' });
    } catch (error) {
        console.log("error", error)
        if (error.isJoi) return res.status(400).send({ message: error.message });
        res.status(500).send({ message: 'Internal Server Error', error:error.message });
    }
}