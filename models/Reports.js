// models/Report.js
import mongoose from 'mongoose';

const VisualizationSchema = new mongoose.Schema({
    // Identificación y metadatos
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
        type: String,
        required: true,
        enum: [
            'gauge',        // Para porcentajes (ej: % circularidad)
            'bar',          // Para comparaciones
            'line',         // Para tendencias
            'pie',          // Para distribución
            'sankey',       // Para flujos
            'table',        // Para datos tabulares
            'kpi',          // Para indicadores clave
            'treemap',      // Para jerarquías
            'scatter',      // Para correlaciones
            'radar'         // Para comparación multidimensional
        ]
    },

    // Configuración específica del gráfico
    config: {
        // Configuración común a todos los tipos
        width: { type: Number, default: 400 },
        height: { type: Number, default: 300 },
        responsive: { type: Boolean, default: true },
        // Otras configuraciones específicas del tipo de visualización
        options: mongoose.Schema.Types.Mixed
    },

    // Datos para la visualización
    data: mongoose.Schema.Types.Mixed,

    // Metadatos adicionales
    position: { type: Number, required: true }, // Orden en la sección
    isVisible: { type: Boolean, default: true }
}, { _id: false, timestamps: false });

const IndicatorValueSchema = new mongoose.Schema({
    // Referencia al indicador
    indicatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Indicator', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true }, // Código único del indicador
    category: { type: String, required: true }, // Categoría del indicador

    // Valores
    value: { type: Number, required: true },
    previousValue: Number, // Valor del período anterior
    targetValue: Number,   // Valor objetivo
    unit: { type: String, required: true }, // Unidad de medida
    trend: { type: Number, default: 0 }, // -1: negativo, 0: estable, 1: positivo

    // Metadatos
    description: String,
    formula: String,
    dataSource: String,
    lastUpdated: Date,

    // Detalles adicionales
    details: mongoose.Schema.Types.Mixed,

    // Visualización por defecto para este indicador
    visualization: {
        type: { type: String, enum: ['gauge', 'bar', 'line', 'pie', 'sankey', 'table'] },
        config: mongoose.Schema.Types.Mixed
    }
}, { _id: false, timestamps: false });

const SectionSchema = new mongoose.Schema({
    // Identificación
    title: { type: String, required: true },
    code: { type: String, required: true }, // Código único de sección
    description: String,
    icon: String, // Ícono para la interfaz

    // Contenido
    indicators: [IndicatorValueSchema],
    visualizations: [VisualizationSchema],

    // Ordenamiento
    order: { type: Number, required: true },
    isCollapsible: { type: Boolean, default: true },
    isExpanded: { type: Boolean, default: true }
}, { _id: false, timestamps: false });

const PeriodSchema = new mongoose.Schema({
    // Fechas exactas
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Período lógico
    year: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12 }, // 1-12
    quarter: { type: Number, min: 1, max: 4 }, // 1-4
    week: { type: Number, min: 1, max: 53 }, // 1-53
    type: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    },

    // Etiquetas legibles
    label: { type: String, required: true }, // "Enero 2023", "Q1 2023", etc.
    shortLabel: String // "Ene 23", "2023", etc.
}, { _id: false, timestamps: false });

const ReportSchema = new mongoose.Schema({
    // Identificación
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // Código único del reporte

    // Contexto
    company: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
        name: { type: String, required: true },
        logo: String
    },

    branch: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
        name: String,
        code: String
    },

    // Período del reporte
    period: { type: PeriodSchema, required: true },

    // Tipo de reporte
    reportType: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    },

    // Estado del reporte
    status: {
        type: String,
        required: true,
        enum: ['draft', 'in_progress', 'completed', 'published', 'archived'],
        default: 'draft'
    },

    // Contenido del reporte
    sections: [SectionSchema],

    // Resumen ejecutivo (KPIs clave)
    summary: {
        // KPIs principales
        mainKpis: [{
            name: String,
            value: Number,
            unit: String,
            trend: Number, // -1, 0, 1
            visualization: mongoose.Schema.Types.Mixed
        }],

        // Resumen por categoría
        byCategory: [{
            category: String,
            value: Number,
            unit: String,
            trend: Number
        }],

        // Tendencias
        trends: [{
            indicator: String,
            currentValue: Number,
            previousValue: Number,
            change: Number, // Porcentaje de cambio
            trend: Number   // -1, 0, 1
        }],

        // Hallazgos clave
        keyFindings: [{
            title: String,
            description: String,
            impact: { type: String, enum: ['high', 'medium', 'low'] },
            indicators: [String] // IDs de indicadores relacionados
        }],

        // Recomendaciones
        recommendations: [{
            title: String,
            description: String,
            priority: { type: String, enum: ['high', 'medium', 'low'] },
            relatedIndicators: [String], // IDs de indicadores relacionados
            estimatedEffort: String, // "bajo", "medio", "alto"
            estimatedImpact: String  // "bajo", "medio", "alto"
        }]
    },

    // Metadatos
    tags: [String],
    isPublic: { type: Boolean, default: false },
    accessControl: {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        roles: [String],
        departments: [String]
    },

    // Auditoría
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: String,
        email: String
    },
    updatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String
    },

    // Configuración
    settings: {
        theme: { type: String, default: 'light' }, // 'light' o 'dark'
        logoPosition: { type: String, default: 'header' }, // 'header', 'footer', 'none'
        customCss: String,
        customJs: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para búsquedas rápidas
ReportSchema.index({
    'company.id': 1,
    'branch.id': 1,
    'period.startDate': -1,
    'period.endDate': -1,
    'period.type': 1,
    status: 1,
    reportType: 1,
    tags: 1
});

// Métodos de utilidad
ReportSchema.methods.getIndicatorValues = function (indicatorCodes = []) {
    const values = {};
    this.sections.forEach(section => {
        section.indicators.forEach(indicator => {
            if (indicatorCodes.length === 0 || indicatorCodes.includes(indicator.code)) {
                values[indicator.code] = indicator.value;
            }
        });
    });
    return values;
};

// Middleware para generar código único
ReportSchema.pre('save', function (next) {
    if (!this.code) {
        const timestamp = new Date().getTime().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 5);
        this.code = `RPT-${timestamp}-${randomStr}`.toUpperCase();
    }

    // Generar etiquetas automáticamente
    if (!this.tags) this.tags = [];

    const autoTags = [
        `type:${this.reportType}`,
        `company:${this.company.name.toLowerCase().replace(/\s+/g, '-')}`,
        `year:${this.period.year}`
    ];

    if (this.branch && this.branch.name) {
        autoTags.push(`branch:${this.branch.name.toLowerCase().replace(/\s+/g, '-')}`);
    }

    // Combinar etiquetas existentes con las automáticas, sin duplicados
    this.tags = [...new Set([...this.tags, ...autoTags])];

    next();
});

const Report = mongoose.model('Report', ReportSchema);
export default Report;