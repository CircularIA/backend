//Models
import Branch from "../models/Branch.js";
import ListInputDat from "../models/ListInputDat.js";
import Indicator from "../models/Indicator.js";
import mongoose from "mongoose";
import InputDat from "../models/InputDat.js";

export const getListInputDats = async (req, res) => {
	try {
		const { branch } = req.params;
		if (branch) {
			const listInputDats = await Branch.findById(branch).populate(
				"inputDats"
			);
			return res.status(200).json(listInputDats);
		} else {
			const listInputDats = await ListInputDat.find();
			res.status(200).json(listInputDats);
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const createListInputDat = async (req, res) => {
	try {
		//Validate the data
		await ListInputDat.validateNewInputDat(req.body);
		const listInputDat = req.body;
		//Have to verify if the list input dat already exist
		const listInputDatExist = await ListInputDat.findOne({
			name: listInputDat.name,
		});
		if (listInputDatExist) {
			return res
				.status(409)
				.json({ message: "List Input Dat already exist" });
		}
		let newListInputDat = new ListInputDat(listInputDat);
		newListInputDat._id = new mongoose.Types.ObjectId();
		await newListInputDat.save();
		res.status(201).json(newListInputDat);
	} catch (error) {
		if (error.name === "ValidationError") {
			res.status(400).json({ message: error.message });
		}
		res.status(409).json({ message: error.message });
	}
};

export const updateListInputDat = async (req, res) => {
	try {
		//Validate the data
		await ListInputDat.validateUpdateInputDat(req.body);

		const { id } = req.params;
		const listInputDat = await ListInputDat.findByIdAndUpdate(id, req.body);
		if (!listInputDat)
			return res
				.status(400)
				.send({ message: "List Input Dat not found" });
		return res.status(200).send({ listInputDat });
	} catch (error) {
		if (error.name === "ValidationError") {
			res.status(400).json({ message: error.message });
		}
		res.status(409).json({ message: error.message });
	}
};

export const deleteListInputDat = async (req, res) => {
	try {
		const { id } = req.params;
		const listInputDat = await ListInputDat.findByIdAndDelete(id);
		if (!listInputDat)
			return res
				.status(400)
				.send({ message: "List Input Dat not found" });
		return res.status(200).send({ listInputDat });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getListInputDatsByIndicator = async (req, res) => {
	try {
		const { indicatorId } = req.params;
		console.log(indicatorId)
		// Find indicator in indicators collection
		const indicator = await Indicator.findById(indicatorId);
		console.log(indicator)
		if (!indicator)
			return res.status(400).send({ message: "Indicator not found" });
		/* indicator have "inputDats" field, array of listInputDats _id´s, populate with listInputDat collection */
		const listInputDats = await ListInputDat.find({
			_id: { $in: indicator.inputDats },
		});
		console.log(listInputDats.length)
		res.status(200).json(listInputDats);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
}

export const getEcoequivalences = async (req, res) => {
	try {
		const { subcategory, year, branch } = req.query;
		
		if (!branch) {
			return res.status(400).json({ message: "Branch is required" });
		}

		// Año actual por defecto si no se proporciona
		const targetYear = year ? parseInt(year) : new Date().getFullYear();
		const startDate = new Date(targetYear, 0, 1); // 1 de enero del año
		const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // 31 de diciembre del año
		
		// Filtro para ListInputDat
		const filter = {};
		if (subcategory) {
			filter.subcategory = subcategory;
		} else {
			filter.subcategory = 'Salida y valorización de Residuos, Productos y subproductos';
		}
		
		// Obtener todos los listInputDats que coincidan con el filtro
		const listInputDats = await ListInputDat.find(filter);
		
		if (!listInputDats.length) {
			return res.status(200).json({ 
				message: "No se encontraron indicadores para la subcategoría especificada",
				data: []
			});
		}
		
		// Obtener los IDs de los listInputDats
		const listInputDatIds = listInputDats.map(item => item._id);
		
		// Buscar todos los InputDat relacionados con estos listInputDats en el período de tiempo especificado
		const inputDats = await InputDat.find({
			listInputDat: { $in: listInputDatIds },
			branch: branch,
			date: { $gte: startDate, $lte: endDate }
		});
		
		// Calcular la suma de valores para cada listInputDat
		const sumByListInputDat = {};
		inputDats.forEach(inputDat => {
			const listInputDatId = inputDat.listInputDat.toString();
			if (!sumByListInputDat[listInputDatId]) {
				sumByListInputDat[listInputDatId] = 0;
			}
			sumByListInputDat[listInputDatId] += inputDat.value;
		});
		
		// Calcular las ecoequivalencias totales
		const totalEcoequivalences = {
			co2: 0,
			agua: 0,
			arboles: 0,
			energia: 0
		};
		
		// Para cada listInputDat, multiplicar su suma por sus ecoequivalencias
		for (const listInputDat of listInputDats) {
			const listInputDatId = listInputDat._id.toString();
			const sum = sumByListInputDat[listInputDatId] || 0;
			
			// Multiplicar la suma por cada ecoequivalencia
			totalEcoequivalences.co2 += sum * (listInputDat.ecoequivalence.co2 || 0);
			totalEcoequivalences.agua += sum * (listInputDat.ecoequivalence.agua || 0);
			totalEcoequivalences.arboles += sum * (listInputDat.ecoequivalence.arboles || 0);
			totalEcoequivalences.energia += sum * (listInputDat.ecoequivalence.energia || 0);
		}
		
		// Preparar la respuesta con detalles de los indicadores y sus valores
		const detailedResponse = {
			year: targetYear,
			subcategory: filter.subcategory,
			indicators: listInputDats.map(item => ({
				name: item.name,
				ecoequivalence: item.ecoequivalence,
				totalValue: sumByListInputDat[item._id.toString()] || 0,
				calculatedEcoequivalences: {
					co2: (sumByListInputDat[item._id.toString()] || 0) * (item.ecoequivalence.co2 || 0),
					agua: (sumByListInputDat[item._id.toString()] || 0) * (item.ecoequivalence.agua || 0),
					arboles: (sumByListInputDat[item._id.toString()] || 0) * (item.ecoequivalence.arboles || 0),
					energia: (sumByListInputDat[item._id.toString()] || 0) * (item.ecoequivalence.energia || 0)
				}
			})),
			ecoequivalences: totalEcoequivalences
		};
		
		res.status(200).json(detailedResponse);
	} catch (error) {
		console.error("Error al calcular ecoequivalencias:", error);
		res.status(500).json({ message: "Error interno del servidor", error: error.message });
	}
};
