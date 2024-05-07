import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const IndicatorsSchema = new Schema(
	{
		_id: Schema.Types.ObjectId,
		name: { type: String, unique: true, required: true },
		source: { type: String, required: true }, //Fuente de donde se obtiene el indicador (CTI, Circulytics)
		//Definir como requerida la categoria
		category: {
			type: String,
			required: true,
			enum: ["Ambiental", "Social", "Economica"],
		}, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
		sourceType: {
			type: String,
			enum: [
				"Residuos",
				"Emisiones",
				"Energía",
				"Agua",
				"Cadena de suministros",
				"Ingreso",
				"Egreso",
				"Social"
			],
		}, //Tipo de fuente (valorización de residuos, emisiones, energía, agua, cadena de suministros)
		description: { type: String }, //Descripcion del indicador
		measurement: { type: String }, //Unidad de medida del indicador
		inputDats: [
			{
				type: Schema.Types.ObjectId,
				ref: "ListInputDat",
			},
		],
		//Valores constantes que se utilizan en la formula
		// factors: [
		// 	{
		// 		name: { type: String },
		// 		value: { type: Number },
		// 		measurement: { type: String },
		// 	},
		// ],
	},
	{ timestamps: true }
);

IndicatorsSchema.statics.validateGetIndicatorValue = async function (id) {
	const Schema = Joi.object({
		branch: Joi.objectId()
			.required()
			.label("Branch")
			.messages({ "string.empty": "Branch is required" }),
		indicator: Joi.objectId()
			.required()
			.label("Indicator")
			.messages({ "string.empty": "Indicator is required" }),
		year: Joi.number()
			.integer()
			.positive()
			.min(1900)
			.max(3000)
			.required()
			.label("Year")
			.messages({ "string.empty": "Year is required" }),
		month: Joi.number().integer().positive().min(1).max(12).label("Month"),
	});
	return Schema.validateAsync(id);
};

//Methods of validate
IndicatorsSchema.statics.validateIndicators = async function (id) {
	const Schema = Joi.object({
		name: Joi.string()
			.required()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		source: Joi.string().label("Source"),
		category: Joi.string()
			.required()
			.label("Category")
			.messages({ "string.empty": "Category is required" }),
		//Validate enum values of sourceType
		sourceType: Joi.string()
			.required()
			.valid(
				"Residuos",
				"Emisiones",
				"Energía",
				"Agua",
				"Cadena de suministros",
				"Ingreso",
				"Egreso",
				"Social"
			)
			.label("Source type")
			.messages({ "string.empty": "Source type is required" }),
		description: Joi.string().label("Description"),
		measurement: Joi.string().label("Measurement"),
		inputDats: Joi.array().items(
			Joi.objectId().label("Input data").messages({
				"string.empty": "Input data is required",
			})
		),
	});
	return Schema.validateAsync(id);
};

IndicatorsSchema.statics.validateUpdateIndicators = async function (id) {
	const Schema = Joi.object({
		name: Joi.string().label("Name"),
		source: Joi.string().label("Source"),
		category: Joi.string().label("Category"),
		sourceType: Joi.string().label("Source type"),
		description: Joi.string().label("Description"),
		measurement: Joi.string().label("Measurement"),
		inputDats: Joi.array()
			.items(
				Joi.objectId().label("Input data").messages({
					"string.empty": "Input data is required",
				})
			)
			.label("Input data"),
	});
	return Schema.validateAsync(id);
};

const Indicator = model("Indicator", IndicatorsSchema);

export default Indicator;
