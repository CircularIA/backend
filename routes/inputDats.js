const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');

const { getInputDats, registerInputDats, updateInputDat, updateInputDats } = require('../controllers/inputDat');

router.get('/:branch', getInputDats);
router.post('/', registerInputDats);
router.post('/update/:id', updateInputDat);
router.post('/update', updateInputDats);


module.exports = router;