import express from 'express';
const router = express.Router();

import verifyToken from '../middlewares/verifyToken.js';
import checkRole from '../middlewares/role-authorize.js';
import {
    generateReport,
    getReport,
    listReports,
    updateReport,
    deleteReport,
    exportToPdf,
    exportToExcel
} from '../controllers/report.js';

// Rutas para generación y obtención de reportes
router.post('/', verifyToken, generateReport);
router.get('/', verifyToken, listReports);
router.get('/:id', verifyToken, getReport);
router.put('/:id', verifyToken, updateReport);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteReport);

// Rutas de exportación
router.get('/:id/export/pdf', verifyToken, exportToPdf);
router.get('/:id/export/excel', verifyToken, exportToExcel);

export default router;