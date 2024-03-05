import { Schema, model } from "mongoose";
import Joi from "joi-oid";

const IndicatorsSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: { type: String, unique: true, required: true },
    source: { type: String, required: true }, //Fuente de donde se obtiene el indicador (CTI, Circulytics)
    //Definir como requerida la categoria
    categorie: { type: String, required: true, enum: [
      "Ambiental",
      "Social",
      "Economica",
    ] }, //Categoria a la que pertenece el indicador (Ambiental, Social, Economica)
    sourceType: {
      type: String,
      enum: [
        "Residuos",
        "Emisiones",
        "Energía",
        "Agua",
        "Cadena de suministros",
      ],
    }, //Tipo de fuente (valorización de residuos, emisiones, energía, agua, cadena de suministros)
    description: { type: String }, //Descripcion del indicador
    measurement: { type: String }, //Unidad de medida del indicador
    inputDats: [
      {
        name: { type: String },
        measurement: { type: String },
      },
    ],
    //Valores constantes que se utilizan en la formula
    // !Este atributo varia segun procesos segun el excel
    factors: [
      {
        name: { type: String },
        value: { type: Number },
        measurement: { type: String },
      },
    ],
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
    categorie: Joi.string()
      .required()
      .label("Categorie")
      .messages({ "string.empty": "Categorie is required" }),
    //Validate enum values of sourceType
    sourceType: Joi.string()
      .required()
      .valid(
        "Valorización de residuos",
        "Emisiones",
        "Energía",
        "Agua",
        "Cadena de suministros"
      )
      .label("Source type")
      .messages({ "string.empty": "Source type is required" }),
    description: Joi.string().label("Description"),
    measurement: Joi.string().label("Measurement"),
    inputDats: Joi.array()
      .required()
      .items(
        Joi.object({
          name: Joi.string().label("Name"),
          measurement: Joi.string().label("Measurement"),
        })
      )
      .label("Input data"),
    factors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().label("Name"),
          value: Joi.number().label("Value"),
          measurement: Joi.string().label("Measurement"),
        })
      )
      .label("Factors"),
  });
  return Schema.validateAsync(id);
};

IndicatorsSchema.statics.validateUpdateIndicators = async function (id) {
  const Schema = Joi.object({
    name: Joi.string().label("Name"),
    source: Joi.string().label("Source"),
    categorie: Joi.string().label("Categorie"),
    sourceType: Joi.string().label("Source type"),
    description: Joi.string().label("Description"),
    measurement: Joi.string().label("Measurement"),
    inputDats: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().label("Name"),
          measurement: Joi.string().label("Measurement"),
        })
      )
      .label("Input data"),
    factors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().label("Name"),
          value: Joi.number().label("Value"),
          measurement: Joi.string().label("Measurement"),
        })
      )
      .label("Factors"),
  });
  return Schema.validateAsync(id);
};

const Indicator = model("Indicator", IndicatorsSchema);

export default Indicator;
