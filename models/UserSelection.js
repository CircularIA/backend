import { Schema, model } from 'mongoose';


const selectionItemSchema = new Schema({
    ecoequivalence: Schema.Types.Mixed, // Usa Mixed si la estructura puede variar
    name: { type: String, required: true },
    description: { type: String, required: true },
    measurement: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    norms: [{ type: String }],
}, {_id: false});

const userSelectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    selections: {
      type: Map,
      of: Map, // Cada categoría puede tener múltiples entradas, así que usamos otro Map
      of: { type: Map, of: selectionItemSchema }
    }
  });
  
// Export
export default model('UserSelection', userSelectionSchema);