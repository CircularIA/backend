const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken.js');

const { getIndicators, getIndicatorValue,  registerIndicator } = require('../controllers/indicator');

router.get('/', getIndicators);
router.post('/value', getIndicatorValue);
router.post('/', registerIndicator);


module.exports = router;
