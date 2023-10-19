const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken.js');
const {getCompany, registerCompany} = require('../controllers/company');


router.get('/', verifyToken, getCompany);
router.post('/registerCompany', registerCompany);

module.exports = router;