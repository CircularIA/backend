import { Schema, model } from "mongoose";

const ImportHistorySchema = new Schema(
    {
        importId: {
            type: String,
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ['in_progress', 'processing_final_batch', 'completed', 'error'],
            default: 'in_progress'
        },
        year: {
            type: Number,
            required: true
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },
        total: {
            type: Number,
            default: 0
        },
        created: {
            type: Number,
            default: 0
        },
        updated: {
            type: Number,
            default: 0
        },
        errorCount: {
            type: Number,
            default: 0
        },
        errorDetails: {
            type: String
        },
        startTime: {
            type: Date,
            default: Date.now
        },
        endTime: {
            type: Date
        }
    },
    { timestamps: true }
);

// Índice compuesto para búsquedas eficientes por usuario y año
ImportHistorySchema.index({ userId: 1, year: 1 });

const ImportHistory = model("ImportHistory", ImportHistorySchema);

export default ImportHistory;
