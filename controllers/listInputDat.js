//Models
import ListInputDat from "../models/ListInputDat.js";
import mongoose from "mongoose";

export const getListInputDats = async (req, res) => {
	try {
		const listInputDats = await ListInputDat.find();
		res.status(200).json(listInputDats);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const createListInputDat = async (req, res) => {
	try {
		//Validate the data
		await ListInputDat.validateNewInputDat(req.body);

		const listInputDat = req.body;
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
		await ListInputDat.validateNewInputDat(req.body);

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
