import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const InputdatSchema = new Schema(
	{
		_id: Schema.Types.ObjectId,
		value: { type: Number, required: [true, "Value is required"] },
		date: { type: Date, default: new Date() },
		//Ref to the list input dat schema
		listInputDat: {
			type: Schema.Types.ObjectId,
			ref: "ListInputDat",
		},
		company: {
			type: Schema.Types.ObjectId,
			ref: "Company",
			required: [true, "Company is required"],
		},
		branch: {
			type: Schema.Types.ObjectId,
			ref: "Branch",
			required: [true, "Branch is required"],
		},
		//User that register the input data and is required
		user: {
			username: {
				type: String,
				required: [true, "User name is required"],
			},
			email: { type: String, required: [true, "User email is required"] },
			role: { type: String, required: [true, "User role is required"] },
		},
	},
	{ timestamps: true }
);

//Methods of validate
InputdatSchema.statics.validateNewInputDat = async function (id) {
	const Schema = Joi.object({
		value: Joi.number()
			.required()
			.label("Value")
			.messages({ "number.empty": "Value is required" }),
		date: Joi.date().required().label("Date"),
		listInputDat: Joi.objectId().label("List Input Dat"),
		company: Joi.objectId()
			.required()
			.label("Company")
			.messages({ "string.empty": "Company is required" }),
		branch: Joi.objectId()
			.required()
			.label("Branch")
			.messages({ "string.empty": "Branch is required" }),
		user: Joi.object({
			username: Joi.string()
				.required()
				.label("Name User")
				.messages({ "string.empty": "Name is required" }),
			email: Joi.string()
				.required()
				.label("Email")
				.messages({ "string.empty": "Email is required" }),
			role: Joi.string()
				.required()
				.label("Role")
				.messages({ "string.empty": "Role is required" }),
		})
			.label("User")
			.messages({ "object.empty": "User is required" }),
	});
	return Schema.validateAsync(id);
};

InputdatSchema.statics.validateUpdateInputDat = async function (id) {
	const Schema = Joi.object({
		id: Joi.objectId()
			.required()
			.label("Id")
			.messages({ "string.empty": "Id is required" }),
		value: Joi.number()
			.required()
			.label("Value")
			.messages({ "number.empty": "Value is required" }),
		date: Joi.date().label("Date"),
		listInputDat: Joi.objectId().label("List Input Dat"),
		user: Joi.object({
			username: Joi.string()
				.required()
				.label("Name")
				.messages({ "string.empty": "Name is required" }),
			email: Joi.string()
				.required()
				.label("Email")
				.messages({ "string.empty": "Email is required" }),
			role: Joi.string()
				.required()
				.label("Role")
				.messages({ "string.empty": "Role is required" }),
		})
			.label("User")
			.messages({ "object.empty": "User is required" }),
	});
	return Schema.validateAsync(id);
};

//Method of validate get input dats by indicator
InputdatSchema.statics.validateGetInputDatsByIndicator = async function (id) {
	const Schema = Joi.object({
		branch: Joi.objectId()
			.required()
			.label("Branch")
			.messages({ "string.empty": "Branch is required" }),
		indicator: Joi.objectId()
			.required()
			.label("Indicator")
			.messages({ "string.empty": "Indicator is required" }),
		year: Joi.number().integer().min(1900).label("Year"),
		month: Joi.number().integer().min(1).max(12).label("Month"),
		day: Joi.number().integer().min(1).max(31).label("Day"),
	});
	return Schema.validateAsync(id);
};

const InputDat = model("InputDat", InputdatSchema);

export default InputDat;
