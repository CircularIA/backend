import { model, Schema } from "mongoose";
import Joi from "joi";

const branchSchema = new Schema(
	{
		_id: Schema.Types.ObjectId,
		name: { type: String, required: [true, "Name is required"] },
		description: { type: String },
		address: { type: String },
		phone: { type: String },
		email: { type: String },
		status: { type: Boolean, default: true },
		//Persona responsable de la sucursal
		company: {
			type: Schema.Types.ObjectId,
			ref: "Company",
			required: [true, "Company is required"],
		},
		manager: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Manager is required"],
		},
		//Indicadores de la sucursal
		inputDats: [
			{
				inputDat: {
					type: Schema.Types.ObjectId,
					ref: "InputDat",
				},
				name: { type: String },
				// activeRegisters: [
				// 	{
				// 		date: { type: Date, default: new Date() }, //Fecha de activacion (año, mes, dia)
				// 		active: { type: Boolean, default: true }, //Valor de activacion
				// 		user: {
				// 			//Usuario que activo el indicador
				// 			name: { type: String },
				// 			email: { type: String },
				// 			role: { type: String },
				// 		},
				// 	},
				// ],
			},
		],
		//Users assigned to the branch
		assignedUsers: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true }
);

//Methods of validate
branchSchema.statics.validateBranch = async function (id) {
	const Schema = Joi.object({
		name: Joi.string()
			.required()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		description: Joi.string().allow('').label("Description"),
		address: Joi.string().required().label("Address"),
		phone: Joi.string().allow('').label("Phone"),
		email: Joi.string().email().allow('').label("Email"),
		company: Joi.string()
			.required()
			.label("Company")
			.messages({ "string.empty": "Company is required" }),
		manager: Joi.string()
			.required()
			.label("Manager")
			.messages({ "string.empty": "Manager is required" }),
		inputDats: Joi.array().items(Joi.object({
			inputDat: Joi.string().required().label("InputDat ID"),
			name: Joi.string().required().label("InputDat Name"),
		})).label("InputDats"),
		assignedUsers: Joi.array().items(Joi.string()).label("Assigned users"),
	});
	return Schema.validateAsync(id);
};

branchSchema.statics.validateUpdateBranch = async function (id) {
	const Schema = Joi.object({
		name: Joi.string()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		description: Joi.string().label("Description"),
		address: Joi.string().label("Address"),
		phone: Joi.string().label("Phone"),
		email: Joi.string().email().label("Email"),
		status: Joi.boolean().label("Status"),
		manager: Joi.string().label("Manager"),
		assignedUsers: Joi.array().items(Joi.string()).label("Assigned users"),
	});
	return Schema.validateAsync(id);
};
const Branch = model("Branch", branchSchema);

export default Branch;
