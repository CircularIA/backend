//Packages
import { Types, startSession } from "mongoose";

//Models
import Indicator from "../models/Indicator.js";
import Branch from "../models/Branch.js";
import InputDat from "../models/InputDat.js";
import User from "../models/User.js";

//Functions
const getValue = (name, inputDatsValues, factors) => {
	//El objetivo de esta funcion es obtener el valor de un indicador con los valores de los input dats
	if (name === "porcentaje de valorización ciclo biológico") {
		//Buscar en la variable inputDatsValues el valor del dato de entrada
		const valores = {
			generacionLodos: 0,
			valCompostaje: 0,
			valMasa : 0,
			valBiodigestion: 0,
			valTratamientoRiles: 0,
			entradaMunicipal: 0,
			potencialValorizacion: 0,
		};
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "generación de lodo") {
				valores["generacionLodos"] = inputDat.value;
			} else if (inputDat.name === "valorización compostaje") {
				valores["valCompostaje"] = inputDat.value;
			} else if (inputDat.name === "valorización masas") {
				valores["valMasa"] = inputDat.value;
			}
			else if (inputDat.name === "valorización biodigestión") {
				valores["valBiodigestion"] = inputDat.value;
			} else if (inputDat.name === "valorización planta de riles") {
				valores["valTratamientoRiles"] = inputDat.value;
			} else if (inputDat.name === "entrada de residuos municipales"){
				valores["entradaMunicipal"] = inputDat.value;
			}
		});
		console.log("factores", factors);
		const factorValue = factors[0]["value"];
		console.log("factorValue", factorValue);
		const valorizado = (valores["generacionLodos"] + valores["valCompostaje"] + valores["valMasa"] + valores["valBiodigestion"] + valores["valTratamientoRiles"])
		//Condicion si maneja entradas municipales o no
		if (valores["entradaMunicipal"] > 0) {
			valores["potencialValorizacion"] = valores["entradaMunicipal"] * factorValue + valorizado;
		} else {
			valores["potencialValorizacion"] = valorizado;
		}
		const valorizacionCicloBiologico =
			valorizado / valores["potencialValorizacion"];
		return valorizacionCicloBiologico * 100;
	} else if (name === "porcentaje de valorizacion ciclo tecnico") {
		let factorValue = 0;
		const valores = {
			entradaResiduos: 0,
			valPec: 0,
			potencialValorizacion: 0,
		};
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "entrada residuos") {
				valores["entradaResiduos"] += inputDat.value;
			} else if (inputDat.name === "val pec") {
				valores["valPec"] += inputDat.value;
			} else if (
				inputDat.name === "potencial valorizacion ciclo tecnico"
			) {
				valores["potencialValorizacion"] += inputDat.value;
			}
		});
		//Retornar el valor junto con el factor
		factorValue =
			(valores["potencialValorizacion"] * 100) /
			valores["entradaResiduos"];
		const porcentajeTecnico =
			(valores["valPec"] * 100) /
			((valores["entradaResiduos"] * factorValue) / 100);
		return porcentajeTecnico;
	}
};

const monthNumberToName = (monthNumber) => {
	const monthNames = [
		"enero",
		"febrero",
		"marzo",
		"abril",
		"mayo",
		"junio",
		"julio",
		"agosto",
		"septiembre",
		"octubre",
		"noviembre",
		"diciembre",
	];
	return monthNames[monthNumber];
};

//Routes

export const getIndicators = async (req, res) => {
	try {
		//Si no hay branch devolver todos los indicators
		if (!req.params.branch) {
			const indicators = await Indicator.find();
			if (!indicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			return res.status(200).send({ indicators });
		} else {
			//Se obtendra todos los indicadores
			const { branch } = req.params;
			const branchIndicators = await Branch.findById(branch).populate(
				"indicators.indicator"
			);
			if (!branchIndicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			return res.status(200).send({ branchIndicators });
		}
	} catch (error) {
		console.log("error", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const getIndicatorValue = async (req, res) => {
	try {
		//Validate the data
		await Indicator.validateGetIndicatorValue(req.params);
		//Se obtendra todos los indicadores
		const branch = req.params.branch;
		const indicator = req.params.indicator;
		const currentIndicator = await Indicator.findById(indicator);
		if (!currentIndicator)
			return res.status(400).send({ message: "Indicator not found" });
		const branchExist = await Branch.findById(branch);
		if (!branchExist)
			return res.status(400).send({ message: "Branch not found" });
		const year = req.params.year;
		//Si no se indica el mes, se obtendra el valor del año
		let month = req.params.month;
		//Obtener los datos de entrada asociados al indicador
		if (!month) {
			console.log(
				"no se ingreso el mes, se obtendra los valores del año: ",
				year
			);
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
				};
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
						},
					},
				]);
				//Si no se encuentran valores, se retorna el valor por defecto
				if (inputDatValues.length === 0) {
					monthValues.push(monthValue);
					continue;
				} else {
					//Si se encuentran valores, se calcula el valor del indicador
					const value = getValue(
						currentIndicator.name,
						inputDatValues,
						currentIndicator.factors
					);
					monthValue.value = value;
					monthValues.push(monthValue);
				}
			}
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
					},
				},
			]);
			//Obtener valor
			if (inputDatsValues.length === 0) {
				return res.status(200).send({ value: -1 });
			} else {
				const value = getValue(currentIndicator.name, inputDatsValues, currentIndicator.factors);
				return res.status(200).send({ value });
			}
		}
	} catch (error) {
		console.log("error", error);
		if (error.isJoi)
			return res.status(400).send({ message: error.details[0].message });
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const registerIndicator = async (req, res) => {
	//Validate the data
	try {
		await Indicator.validateIndicators(req.body);
		const {
			name,
			source,
			categorie,
			sourceType,
			description,
			measurement,
			inputDats,
			factors,
		} = req.body;
		//Have to check if the indicator exist
		const indicatorExist = await Indicator.findOne({ name });
		if (indicatorExist)
			return res.status(400).send({ message: "Indicator already exist" });
		//*Como ya no se ocupara code, no se necesita guardar los datos de entrada
		//*Por lo que no es necesario ser una operacion atomica
		//?Solamente guardar el dato en el indicador
		//Verificar si tiene la estructura requerida
		for (const inputDat of inputDats) {
			await InputDat.validateFirstInputDat(inputDat);
		}
		const newIndicator = new Indicator({
			_id: new Types.ObjectId(),
			name,
			source,
			categorie,
			sourceType,
			description,
			measurement,
			inputDats,
			factors,
		});
		const result = await newIndicator.save();
		if (!result)
			return res
				.status(400)
				.send({ message: "Failed to register indicator" });
		return res.status(200).send({ message: "Indicator registered" });
	} catch (error) {
		console.log("error", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const updateIndicator = async (req, res) => {
	try {
		//Validate the data
		await Indicator.validateUpdateIndicators(req.body);
		const {
			name,
			source,
			categorie,
			sourceType,
			description,
			measurement,
			inputDats,
			factors,
		} = req.body;
		//Have to check if the indicator exist
		const indicatorExist = await Indicator.findById(req.params.id);
		if (!indicatorExist)
			return res.status(400).send({ message: "Indicator not found" });
		//Verificar si tiene la estructura requerida solo en caso si se recibe un dato de entrada
		if (inputDats) {
			for (const inputDat of inputDats) {
				await InputDat.validateFirstInputDat(inputDat);
			}
		}
		const result = await Indicator.findByIdAndUpdate(req.params.id, {
			...req.body,
		});
		if (!result)
			return res
				.status(400)
				.send({ message: "Failed to update indicator" });
		return res.status(200).send({ message: "Indicator updated" });
	} catch (error) {
		console.log("error", error);
		if (error.isJoi)
			return res.status(400).send({ message: error.details[0].message });
		res.status(500).send({ message: "Internal Server Error" });
	}
};
//Asignar indicadores a una sucursal
export const assignIndicator = async (req, res) => {
	try {
		//Obtener los valores de entrada
		const { branch, indicator } = req.body;
		//Obtener la sucursal
		const branchExist = await Branch.findById(branch).populate(
			"indicators"
		);
		if (!branchExist)
			return res.status(400).send({ message: "Branch not found" });
		//Obtener los indicadores
		const indicatorExist = await Indicator.findById(indicator);
		if (!indicatorExist)
			return res.status(400).send({ message: "Indicator not found" });
		//Obtener el usuario
		const currentUser = await User.findById(req.user._id);
		if (!currentUser)
			return res.status(400).send({ message: "User not found" });
		//!Verificar si el usuario tiene permiso para asignar indicadores a esta sucursal
		//Verificar si el indicador ya esta asignado a la sucursal
		const indicatorAssigned = branchExist.indicators.find(
			(item) =>
				item.indicator._id.toString() === indicatorExist._id.toString()
		);
		if (indicatorAssigned)
			return res
				.status(400)
				.send({ message: "Indicator already assigned" });
		//Datos de entrada asignados
		let assignedInputDats = [];
		for (const inputDat of indicatorExist.inputDats) {
			assignedInputDats.push({
				name: inputDat.name,
				measurement: inputDat.measurement,
				active: true,
				activeRegisters: [
					{
						date: new Date(),
						active: true,
						user: {
							name: currentUser.username,
							email: currentUser.email,
							role: currentUser.role,
						},
					},
				],
			});
		}
		const assignedIndicator = {
			indicator: indicatorExist._id,
			sourceType: indicatorExist.sourceType,
			inputDats: assignedInputDats,
			active: true,
			activeRegisters: [
				{
					date: new Date(),
					active: true,
					user: {
						name: currentUser.username,
						email: currentUser.email,
						role: currentUser.role,
					},
				},
			],
		};
		branchExist.indicators.push(assignedIndicator);
		//Save the branch
		await branchExist.save();
		res.status(200).send({ message: "Indicators assigned" });
	} catch (error) {
		console.log("error", error);
		res.status(500).send({
			message: "Internal Server Error",
			error: error,
		});
	}
};
