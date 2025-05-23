// controllers/reportController.js
import reportService from './reportService.js';
import { validationResult } from 'express-validator';
import Company from '../models/Company.js';
import Branch from '../models/Branch.js';
import { getPeriodLabel, getShortPeriodLabel } from './period.js';
import Report from '../models/Reports.js';
import Indicator from '../models/Indicator.js';
import InputDat from '../models/InputDat.js';
import { getValue } from './indicator.js';

/**
 * Genera un nuevo reporte
 */

export const generateReport = async (req, res) => {
    try {
        const { companyId, branchId, period, reportType } = req.body;

        // Validar que existan los datos requeridos
        if (!companyId || !period || !reportType) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        // Obtener datos de la compañía
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Compañía no encontrada'
            });
        }

        // Obtener datos de la sucursal si se proporciona
        let branch = null;
        if (branchId) {
            branch = await Branch.findById(branchId);
        }

        // Asegurar que las fechas sean consistentes y que el año se extraiga correctamente
        const reportYear = new Date(period.startDate).getUTCFullYear();
        console.log(`Generando reporte para el año: ${reportYear}`);
        
        // Crear el objeto del reporte
        const reportData = {
            title: `Reporte Anual ${reportYear} - ${company.name}${branch ? ` - ${branch.name}` : ''}`,
            company: {
                id: company._id,
                name: company.name,
                logo: company.logo
            },
            reportType,
            period: {
                startDate: new Date(period.startDate),
                endDate: new Date(period.endDate),
                year: reportYear, // Usar la variable para asegurar consistencia
                type: reportType,
                label: `Año ${reportYear}`, // Usar la misma variable
                shortLabel: String(reportYear) // Usar la misma variable
            },
            createdBy: {
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email
            },
            // Inicializar secciones vacías que se llenarán después
            sections: [],
            summary: {
                mainKpis: [],
                byCategory: [],
                trends: [],
                keyFindings: [],
                recommendations: []
            }
        };

        // Generar código único para el reporte
        const timestamp = new Date().getTime().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 5);
        reportData.code = `RPT-${timestamp}-${randomStr}`.toUpperCase();

        // Si hay branch, agregar información de la sucursal
        if (branch) {
            reportData.branch = {
                id: branch._id,
                name: branch.name,
                code: branch.code
            };
        }

        // 1. Obtener todos los indicadores
        const indicators = await Indicator.find({}).lean();

        console.log("Indicadores encontrados:", indicators.length);

        // Verificar si hay datos de entrada disponibles
        const testData = await InputDat.find({
            companyId,
            date: {
                $gte: new Date(period.startDate),
                $lte: new Date(period.endDate)
            }
        }).limit(5);
        console.log('Datos de entrada disponibles:', testData.length > 0 ? 'Sí' : 'No');
        if (testData.length > 0) {
            console.log('Muestra de datos:', testData[0]);
        }

        // 2. Para cada indicador, obtener sus valores
        for (const indicator of indicators) {
            console.log("Procesando indicador:", indicator.name);
            // Obtener los IDs de los ListInputDat asociados al indicador
            console.log(`Buscando datos para indicador: ${indicator.name} (${indicator._id})`);
            
            // Buscar InputDat que coincidan con los ListInputDat del indicador
            console.log(`Buscando datos para el período: ${new Date(period.startDate).toISOString()} - ${new Date(period.endDate).toISOString()}`);
            console.log(`Usando company: ${companyId}, branch: ${branchId}`);
            console.log(`InputDats del indicador: ${indicator.inputDats}`);
            
            const inputDatsValues = await InputDat.find({
                company: companyId,
                branch: branchId,
                date: {
                    $gte: new Date(period.startDate),
                    $lte: new Date(period.endDate)
                },
                // Buscar por listInputDat que esté en los inputDats del indicador
                listInputDat: { $in: indicator.inputDats }
            }).lean();
            
            console.log(`Encontrados ${inputDatsValues.length} datos para el indicador ${indicator.name}`);
            if (inputDatsValues.length > 0) {
                console.log('Muestra de datos:', inputDatsValues[0]);
            }

            // 3. Calcular el valor del indicador
            let result, details;
            try {
                const valueResult = getValue(indicator.name, inputDatsValues);
                
                // Verificar si el resultado es un objeto o un valor directo
                if (valueResult && typeof valueResult === 'object' && 'result' in valueResult) {
                    result = valueResult.result;
                    details = valueResult.details || {};
                } else {
                    // Si es un valor directo
                    result = valueResult;
                    details = { value: valueResult };
                }
                
                console.log(`Valor calculado para ${indicator.name}:`, result);
                
                // Si el resultado está en details pero no en result
                if (details && typeof details === 'object') {
                    // Si hay un valor en details.undefined, usarlo como resultado
                    if (details.undefined !== undefined && (result === undefined || isNaN(result))) {
                        console.log(`Usando valor de details.undefined para ${indicator.name}:`, details.undefined);
                        result = details.undefined;
                    }
                }
            } catch (error) {
                console.error(`Error calculando valor para ${indicator.name}:`, error);
                continue; // Saltar este indicador si hay error
            }

            console.log("Valor calculado:", result);

            // 4. Agregar a la sección correspondiente
            const sectionIndex = reportData.sections.findIndex(s => s.title === indicator.category);
            
            // Validar el resultado y proporcionar valores por defecto
            let validatedResult = result;
            if (isNaN(result)) {
                console.log(`Valor NaN detectado para ${indicator.name}, estableciendo a 0`);
                validatedResult = 0;
            }
            
            const indicatorData = {
                indicatorId: indicator._id,
                name: indicator.name,
                code: indicator.code || `IND-${indicator._id.toString().substr(-6)}`,
                category: indicator.category,
                value: validatedResult,
                unit: indicator.measurement || '%', // Usar el campo measurement del modelo Indicator
                details
            };

            if (sectionIndex === -1) {
                // Crear nueva sección si no existe
                reportData.sections.push({
                    title: indicator.category,
                    code: indicator.category.toLowerCase().replace(/\s+/g, '-'),
                    description: `Indicadores de categoría ${indicator.category}`,
                    indicators: [indicatorData],
                    visualizations: [
                        {
                            title: `Resumen de ${indicator.category}`,
                            description: `Visualización de indicadores de ${indicator.category}`,
                            type: 'bar',
                            config: {
                                width: 400,
                                height: 300,
                                responsive: true,
                                options: {}
                            },
                            data: {
                                labels: [indicator.name],
                                datasets: [{
                                    label: indicator.name,
                                    data: [validatedResult]
                                }]
                            },
                            position: 1,
                            isVisible: true
                        }
                    ],
                    order: reportData.sections.length + 1,
                    isCollapsible: true,
                    isExpanded: true
                });
            } else {
                // Agregar a sección existente
                reportData.sections[sectionIndex].indicators.push(indicatorData);
                
                // Actualizar la visualización existente o crear una nueva
                const visualization = reportData.sections[sectionIndex].visualizations.find(v => v.type === 'bar');
                if (visualization) {
                    // Actualizar visualización existente
                    visualization.data.labels.push(indicator.name);
                    visualization.data.datasets[0].data.push(validatedResult);
                } else {
                    // Crear nueva visualización
                    reportData.sections[sectionIndex].visualizations.push({
                        title: `Resumen de ${indicator.category}`,
                        description: `Visualización de indicadores de ${indicator.category}`,
                        type: 'bar',
                        config: {
                            width: 400,
                            height: 300,
                            responsive: true,
                            options: {}
                        },
                        data: {
                            labels: [indicator.name],
                            datasets: [{
                                label: indicator.name,
                                data: [validatedResult]
                            }]
                        },
                        position: reportData.sections[sectionIndex].visualizations.length + 1,
                        isVisible: true
                    });
                }
            }

            // 5. Agregar a KPIs principales si es necesario
            // Consideramos todos los indicadores como principales para el resumen
            reportData.summary.mainKpis.push({
                name: indicator.name,
                value: validatedResult,
                unit: indicator.measurement || '%',
                trend: 0 // Calcular tendencia si es necesario
            });
            
            // Agregar a resumen por categoría
            const categoryIndex = reportData.summary.byCategory.findIndex(c => c.category === indicator.category);
            if (categoryIndex === -1) {
                reportData.summary.byCategory.push({
                    category: indicator.category,
                    value: validatedResult,
                    unit: indicator.measurement || '%',
                    trend: 0
                });
            } else {
                // Promediar valores de la misma categoría
                const currentValue = reportData.summary.byCategory[categoryIndex].value;
                const count = reportData.sections.find(s => s.title === indicator.category).indicators.length;
                reportData.summary.byCategory[categoryIndex].value = (currentValue * (count - 1) + validatedResult) / count;
            }
        }

        // 6. Crear el reporte en la base de datos
        const report = new Report(reportData);
        await report.save();

        return res.status(201).json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Error al generar el reporte:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

/**
 * Obtiene un reporte por ID
 */
export const getReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await reportService.getReportById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error obteniendo reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte'
        });
    }
};

/**
 * Lista reportes con filtros
 */
export const listReports = async (req, res) => {
    try {
        const { companyId, branchId, startDate, endDate, reportType, status } = req.query;
        const filters = {
            companyId,
            branchId,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            reportType,
            status
        };

        const reports = await reportService.listReports(filters);

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Error listando reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar los reportes'
        });
    }
};

/**
 * Actualiza un reporte existente
 */
export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user._id; // ID del usuario que realiza la actualización

        const updatedReport = await reportService.updateReport(id, updateData, userId);

        res.json({
            success: true,
            data: updatedReport
        });
    } catch (error) {
        console.error('Error actualizando reporte:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar el reporte'
        });
    }
};

/**
 * Elimina un reporte
 */
export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        await reportService.deleteReport(id);

        res.json({
            success: true,
            message: 'Reporte eliminado correctamente'
        });
    } catch (error) {
        console.error('Error eliminando reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el reporte'
        });
    }
};

/**
 * Exporta un reporte a PDF
 */
export const exportToPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const pdfBuffer = await reportService.exportToPdf(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-${id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar el reporte a PDF'
        });
    }
};

/**
 * Exporta un reporte a Excel
 */
export const exportToExcel = async (req, res) => {
    try {
        const { id } = req.params;
        const excelBuffer = await reportService.exportToExcel(id);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-${id}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar el reporte a Excel'
        });
    }
};