import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const InputdatSchema = new Schema(
	{
		_id: Schema.Types.ObjectId,
		//Index of equal inputs data
		index: { type: Number, default: 0 },
		//Name of the input data
		name: { type: String, required: [true, "Name is required"] },
		description: { type: String },
		value: { type: Number, required: [true, "Value is required"] },
		date: { type: Date, default: new Date() },
		measurement: { type: String },
		norm: { type: String, required: true}, //Fuente de donde se obtuvo el dato (CTI Tools, Norma ESRS E5)
		categorie: { type: String, required: true, enum: [
			"Ambiental",
			"Social",
			"Economica",
		]}, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
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
			username: { type: String, required: [true, "User name is required"] },
			email: { type: String, required: [true, "User email is required"] },
			role: { type: String, required: [true, "User role is required"] },
		},
	},
	{ timestamps: true }
);
//Override pre save method to increment the index of the input data
InputdatSchema.pre("save", async function (next) {
	if (!this.isNew){
		return next();
	}
	try {
		const inputDat = this;
		const lastInputDat = await InputDat.findOne({ company: inputDat.company }).sort({ index: -1 });
		if (lastInputDat) {
			inputDat.index = lastInputDat.index + 1;
		}
		next();
	} catch (error) {
		next(error)
	}
});


//Methods of validate
InputdatSchema.statics.validateNewInputDat = async function (id) {
	const Schema = Joi.object({
		name: Joi.string()
			.required()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		description: Joi.string().label("Description"),
		value: Joi.number()
			.required()
			.label("Value")
			.messages({ "number.empty": "Value is required" }),
		date: Joi.date().required().label("Date"),
		measurement: Joi.string().label("Measurement"),
		norm: Joi.string().required().label("Norm"),
		categorie: Joi.string().required().label("Categorie"),
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

InputdatSchema.statics.validateUpdateInputDat = async function (id) {
	const Schema = Joi.object({
		id: Joi.objectId()
			.required()
			.label("Id")
			.messages({ "string.empty": "Id is required" }),
		name: Joi.string()
			.required()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		value: Joi.number()
			.required()
			.label("Value")
			.messages({ "number.empty": "Value is required" }),
		date: Joi.date().label("Date"),
		measurement: Joi.string().label("Measurement"),
		user: Joi.object({
			name: Joi.string()
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

//Method to validate the code in register indicator
InputdatSchema.statics.validateFirstInputDat = async function (id) {
	const Schema = Joi.object({
		name: Joi.string()
			.required()
			.label("Name")
			.messages({ "string.empty": "Name is required" }),
		measurement: Joi.string().label("Measurement"),
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
