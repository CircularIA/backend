const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');

const { getInputDats, getInputDatsByIndicator, registerInputDats, updateInputDat, updateInputDats } = require('../controllers/inputDat');

router.get('/:branch', getInputDats);
router.get('/byIndicator/:branch/:indicator', getInputDatsByIndicator);
router.post('/', registerInputDats);
router.post('/update/:id', updateInputDat);
router.post('/update', updateInputDats);


module.exports = router;