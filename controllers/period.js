// controllers/period.js

/**
 * Obtiene la etiqueta legible para un período
 * @param {string} periodType - Tipo de período (daily, weekly, monthly, quarterly, yearly)
 * @param {string|Date} date - Fecha del período
 * @returns {string} Etiqueta del período
 */
export function getPeriodLabel(periodType, date) {
    const d = new Date(date);
    const options = { year: 'numeric' };
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    switch (periodType) {
        case 'daily':
            return d.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        case 'weekly':
            const weekStart = new Date(d);
            const weekEnd = new Date(d);
            weekEnd.setDate(d.getDate() + 6);
            return `Semana del ${weekStart.getDate()} al ${weekEnd.getDate()} de ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        case 'monthly':
            return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        case 'quarterly':
            const quarter = Math.floor(d.getMonth() / 3) + 1;
            return `T${quarter} ${d.getFullYear()}`;
        case 'yearly':
            return d.getFullYear().toString();
        default:
            return d.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
    }
}

/**
 * Obtiene una versión corta de la etiqueta del período
 * @param {string} periodType - Tipo de período (daily, weekly, monthly, quarterly, yearly)
 * @param {string|Date} date - Fecha del período
 * @returns {string} Etiqueta corta del período
 */
export function getShortPeriodLabel(periodType, date) {
    const d = new Date(date);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    switch (periodType) {
        case 'daily':
            return d.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        case 'weekly':
            return `S${Math.ceil(d.getDate() / 7)} ${monthNames[d.getMonth()]}`;
        case 'monthly':
            return monthNames[d.getMonth()] + ' ' + d.getFullYear().toString().substr(-2);
        case 'quarterly':
            return `T${Math.floor(d.getMonth() / 3) + 1} '${d.getFullYear().toString().substr(-2)}`;
        case 'yearly':
            return d.getFullYear().toString();
        default:
            return d.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
            });
    }
}