const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken.js');
const {getCompany, registerCompany, updatecompany} = require('../controllers/company');


router.get('/', verifyToken, getCompany);
router.post('/registerCompany', registerCompany);
router.put('/updateCompany', verifyToken, updatecompany);

module.exports = router;