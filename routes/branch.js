const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');
const { getBranch, getIndicators, registerBranch, updateBranch } = require('../controllers/branch');

router.get('/', verifyToken, getBranch);
router.get('/indicators/:id', getIndicators);
router.post('/registerBranch', registerBranch);
router.put('/updateBranch', verifyToken, updateBranch);

module.exports = router;