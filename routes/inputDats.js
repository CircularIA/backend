const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');

const { getInputDats, registerInputDats } = require('../controllers/inputDat');

router.get('/', verifyToken, getInputDats);
router.post('/', registerInputDats);

module.exports = router;