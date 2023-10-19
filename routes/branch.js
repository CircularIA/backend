const router = require('express').Router();

const verifyToken = require('../middlewares/verifyToken.js');
const { getBranch } = require('../controllers/branch');

router.get('/', verifyToken, getBranch);

module.exports = router;