import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const ListInputDatSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: [true, "Name is required"] },
	description: { type: String },
	measurement: { type: String },
	//Norm is determined by indicator
	categorie: {
		type: String,
		required: true,
		enum: ["Ambiental", "Social", "Economica"],
	},
});

ListInputDatSchema.statics.validateNewInputDat = async (inputDat) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string(),
		measurement: Joi.string(),
		categorie: Joi.string()
			.required()
			.valid("Ambiental", "Social", "Economica"),
	});
};

const ListInputDat = model("ListInputDat", ListInputDatSchema);

export default ListInputDat;
