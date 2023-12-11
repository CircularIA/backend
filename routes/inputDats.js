const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');

const { getInputDats, getInputDatsByIndicator, registerInputDats, registerInputDatsMany, updateInputDat, updateInputDats } = require('../controllers/inputDat');

router.get('/:branch', getInputDats);
router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', getInputDatsByIndicator);
router.post('/', registerInputDats);
router.post('/many/:branch/:indicator', registerInputDatsMany);
router.post('/update/:id', updateInputDat);
router.post('/update', updateInputDats);


module.exports = router;