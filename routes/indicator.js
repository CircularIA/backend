const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken.js');

const { getIndicators, getIndicatorValue,  registerIndicator } = require('../controllers/indicator');

router.get('/', getIndicators);
router.get('/value/:branch/:indicator/:year/:month?', getIndicatorValue);
router.post('/', registerIndicator);
//router.get('/byIndicator/:branch/:indicator/:year?/:month?/:day?', getInputDatsByIndicator);

module.exports = router;
