const router = require('express').Router();

const {registerCompany} = require('../controllers/company');

router.post('/registerCompany', registerCompany);

module.exports = router;