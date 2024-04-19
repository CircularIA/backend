//Packages
import { Types } from "mongoose";

//Models
import Indicator from "../models/Indicator.js";
import Branch from "../models/Branch.js";
import InputDat from "../models/InputDat.js";
import ListInputDat from "../models/ListInputDat.js";

//Functions
const getValue = (name, inputDatsValues) => {
	//El objetivo de esta funcion es obtener el valor de un indicador con los valores de los input dats
	if (name === "Porcentaje de valorización ciclo biológico") {
		//Buscar en la variable inputDatsValues el valor del dato de entrada
		const valores = {
			generacionLodos: 0,
			salidaCompostaje: 0,
			salidaMasas: 0,
			salidaBiodigestion: 0,
			salidaRiles: 0,
			salidaResiduosMunicipales: 0,
		};
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] = inputDat.value;
			} else if (inputDat.name === "Salida compostaje") {
				valores["valCompostaje"] = inputDat.value;
			} else if (inputDat.name === "Salida masas") {
				valores["valMasa"] = inputDat.value;
			} else if (inputDat.name === "Salida biodigestión") {
				valores["valBiodigestion"] = inputDat.value;
			} else if (inputDat.name === "Salida RILES tratados") {
				valores["valTratamientoRiles"] = inputDat.value;
			} else if (inputDat.name === "Salida residuos municipales") {
				valores["entradaMunicipal"] = inputDat.value;
			}
		});
		const numerador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"];
		const denominador =
			numerador + valores["salidaResiduosMunicipales"] * 0.6;
		return numerador / denominador;
	} else if (name === "Porcentaje de valorización ciclo técnico") {
		const valores = {
			generacionLodos: 0,
			entradaMunicipal: 0,
			salidaPlastico: 0,
			salidaChatarraFerrosa: 0,
			salidaAluminio: 0,
			salidaTetrapack: 0,
			salidaIncineracionBiomasa: 0,
			salidaReutilizacion: 0,
			salidaPeligrosos: 0,
			salidaInerte: 0,
			entradaCircularAgua: 0,
		};
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Salida residuos municipales") {
				valores["entradaMunicipal"] = inputDat.value;
			} else if (inputDat.name === "Salida Plástico") {
				valores["salidaPlastico"] = inputDat.value;
			} else if (inputDat.name === "Salida chatarra ferrosa") {
				valores["salidaChatarraFerrosa"] = inputDat.value;
			} else if (inputDat.name === "Salida aluminio") {
				valores["salidaAluminio"] = inputDat.value;
			} else if (inputDat.name === "Salida tetrapack") {
				valores["salidaTetrapack"] = inputDat.value;
			} else if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] = inputDat.value;
			} else if (inputDat.name === "Salida reutilización") {
				valores["salidaReutilizacion"] = inputDat.value;
			} else if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] = inputDat.value;
			} else if (inputDat.name === "Salida inerte") {
				valores["salidaInerte"] = inputDat.value;
			} else if (inputDat.name === "Entrada circular agua") {
				valores["entradaCircularAgua"] = inputDat.value;
			} else if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] = inputDat.value;
			}
		});
		//Retornar el valor junto con el factor
		const numerador =
			valores["salidaChatarraFerrosa"] +
			valores["salidaPlastico"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaIncineracionBiomasa"] +
			valores["salidaPeligrosos"];
		const denominador =
			valores["salidaChatarraFerrosa"] +
			valores["salidaPlastico"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaReutilizacion"] +
			valores["salidaPeligrosos"] +
			valores["salidaInerte"] +
			valores["entradaMunicipal"] * 0.6 +
			valores["entradaMunicipal"] *
				(valores["generacionLodos"] - valores["entradaCircularAgua"]);
		return numerador / denominador;
	} else if (name === "Porcentaje circularidad de salida") {
		const valores = {
			generacionLodos: 0,
			salidaCompostaje: 0,
			salidaMasas: 0,
			salidaBiodigestion: 0,
			salidaRiles: 0,
			salidaResiduosMunicipales: 0,
			salidaCartonPapel: 0,
			salidaPlastico: 0,
			salidaChatarraFerrosa: 0,
			salidaAluminio: 0,
			salidaTetrapack: 0,
			salidaIncineracionBiomasa: 0,
			salidaCoproceso: 0,
			salidaReutilizacion: 0,
			salidaPeligrosos: 0,
			salidaInerte: 0,
		};
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] += inputDat.value;
			} else if (inputDat.name === "Salida compostaje") {
				valores["salidaResiduos"] += inputDat.value;
			} else if (inputDat.name === "Salida masas") {
				valores["salidaMasas"] += inputDat.value;
			} else if (inputDat.name === "Salida biodigestión") {
				valores["salidaBiodigestion"] += inputDat.value;
			} else if (inputDat.name === "Salida RILES tratados") {
				valores["salidaRiles"] += inputDat.value;
			} else if (inputDat.name === "Salida residuos municipales") {
				valores["salidaResiduosMunicipales"] += inputDat.value * 0.6;
			} else if (inputDat.name === "Salida Cartón/Papel") {
				valores["salidaCartonPapel"] += inputDat.value;
			} else if (inputDat.name === "Salida Plástico") {
				valores["salidaPlastico"] += inputDat.value;
			} else if (inputDat.name === "Salida chatarra ferrosa") {
				valores["salidaChatarraFerrosa"] += inputDat.value;
			} else if (inputDat.name === "Salida aluminio") {
				valores["salidaAluminio"] += inputDat.value;
			} else if (inputDat.name === "Salida tetrapack") {
				valores["salidaTetrapack"] += inputDat.value;
			} else if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] += inputDat.value;
			} else if (inputDat.name === "Salida coproceso") {
				valores["salidaCoproceso"] += inputDat.value;
			} else if (inputDat.name === "Salida reutilización") {
				valores["salidaReutilizacion"] += inputDat.value;
			} else if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] += inputDat.value;
			} else if (inputDat.name === "Salida inerte") {
				valores["salidaInerte"] += inputDat.value;
			}
		});
		console.log("valores", valores);
		const numerador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaReutilizacion"];
		const denominador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaResiduosMunicipales"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaIncineracionBiomasa"] +
			valores["salidaCoproceso"] +
			valores["salidaReutilizacion"] +
			valores["salidaPeligrosos"] +
			valores["salidaInerte"];
		return numerador / denominador;
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
		if (req.params.branch) {
			const branch = await Branch.findById(req.params.branch);
			if (!branch)
				return res.status(400).send({ message: "Branch not found" });
			const indicators = await Indicator.find();
			if (!indicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			const branchIndicators = indicators.filter((indicator) =>
				indicator.inputDats.some((inputDat) =>
					branch.inputDats.includes(inputDat)
				)
			);
			return res.status(200).send({ indicators: branchIndicators });
		} else {
			const indicators = await Indicator.find();
			if (!indicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			return res.status(200).send({ indicators });
		}
	} catch (error) {
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

		//Create and array with the listInputDat indexes from the indicator
		const listInputDatsIndexes = currentIndicator.inputDats.map(
			(inputDat) => inputDat._id
		);

		const year = req.params.year;
		//Si no se indica el mes, se obtendra el valor del año
		let month = req.params.month;
		//Obtener los datos de entrada asociados al indicador
		if (!month) {
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
				let inputDatValues = await InputDat.aggregate([
					{
						$match: {
							date: {
								$gte: startDate,
								$lte: endDate,
							},
							branch: branchExist._id,
							listInputDat: { $in: listInputDatsIndexes },
						},
					},
					{
						$lookup: {
							from: "listinputdats",
							localField: "listInputDat",
							foreignField: "_id",
							as: "listInputDatDetails",
						},
					},
					{
						$unwind: {
							path: "$listInputDatDetails",
							preserveNullAndEmptyArrays: true, // Conservar los documentos incluso si no hay correspondencia en el lookup.
						},
					},
					{
						$addFields: {
							name: "$listInputDatDetails.name",
						},
					},
					{
						$project: {
							listInputDatDetails: 0,
						},
					},
				]);
				console.log(
					"🚀 ~ getIndicatorValue ~ inputDatValues:",
					inputDatValues
				);
				//Si no se encuentran valores, se retorna el valor por defecto
				if (inputDatValues.length === 0) {
					monthValues.push(monthValue);
					continue;
				} else {
					const value = getValue(
						currentIndicator.name,
						inputDatValues
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
			const inputDatsValues = await InputDat.aggregate([
				{
					$match: {
						listInputDat: { $in: listInputDatsIndexes },
						date: {
							$gte: startDate,
							$lte: endDate,
						},
						branch: branchExist._id,
					},
				},
				{
					$lookup: {
						from: "listinputdats",
						localField: "listInputDat",
						foreignField: "_id",
						as: "listInputDatDetails",
					},
				},
				{
					$unwind: {
						path: "$listInputDatDetails",
						preserveNullAndEmptyArrays: true, // Conservar los documentos incluso si no hay correspondencia en el lookup.
					},
				},
				{
					$addFields: {
						name: "$listInputDatDetails.name",
					},
				},
				{
					$project: {
						listInputDatDetails: 0,
					},
				},
			]);
			//Obtener valor
			if (inputDatsValues.length === 0) {
				return res.status(200).send({ value: -1 });
			} else {
				const value = getValue(currentIndicator.name, inputDatsValues);
				return res.status(200).send({ value });
			}
		}
	} catch (error) {
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
			category,
			sourceType,
			description,
			measurement,
			inputDats,
		} = req.body;
		//Have to check if the indicator exist
		const indicatorExist = await Indicator.findOne({ name: name });
		if (indicatorExist)
			return res.status(400).send({ message: "Indicator already exist" });

		//Have to verify the reference of the input dats if they exist
		if (inputDats) {
			for (const inputDat of inputDats) {
				const inputDatExist = await ListInputDat.findById(inputDat);
				if (!inputDatExist)
					return res
						.status(400)
						.send({ message: "InputDat not found" });
			}
		}
		const newIndicator = new Indicator({
			_id: new Types.ObjectId(),
			name,
			source,
			category,
			sourceType,
			description,
			measurement,
			inputDats,
		});
		const result = await newIndicator.save();
		if (!result)
			return res
				.status(400)
				.send({ message: "Failed to register indicator" });
		return res.status(200).send({ message: "Indicator registered" });
	} catch (error) {
		console.log("error", error);
		if (error.name === "ValidationError") {
			return res.status(400).send({ message: error.message });
		}
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
			category,
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
