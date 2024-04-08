import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const ListInputDatSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: [true, "Name is required"] },
	description: { type: String },
	measurement: { type: String },
	//Norm is determined by indicator
	category: {
		type: String,
		required: true,
		enum: ["Ambiental", "Social", "Economica"],
	},
	subcategory: {
		type: String,
		required: true,
		enum: [
			"Salida y valorización de Residuos, Productos y subproductos",
			"Agua",
			"Energía",
			"Huella de carbono de salida",
			"Entrada de suministros",
			"Productividad circular de material",
			"Porcentaje de ingreso por acciones circulares",
			"Porcentaje inversión en circularidad",
			"Empleo verde",
			"Porcentaje de empleos circulares",
			"Educación ambiental interna",
			"Porcentaje de participación femenina",
			"Social explícito",
		],
	},
});

ListInputDatSchema.statics.validateNewInputDat = async (inputDat) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string(),
		measurement: Joi.string(),
		category: Joi.string()
			.required()
			.valid("Ambiental", "Social", "Economica"),
		subcategory: Joi.string()
			.required()
			.valid(
				"Salida y valorización de Residuos, Productos y subproductos",
				"Agua",
				"Energía",
				"Huella de carbono de salida",
				"Entrada de suministros",
				"Productividad circular de material",
				"Porcentaje de ingreso por acciones circulares",
				"Porcentaje inversión en circularidad",
				"Empleo verde",
				"Porcentaje de empleos circulares",
				"Educación ambiental interna",
				"Porcentaje de participación femenina",
				"Social explícito"
			),
	});
};

const ListInputDat = model("ListInputDat", ListInputDatSchema);

export default ListInputDat;
