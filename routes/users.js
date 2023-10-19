const router = require('express').Router();

const {getUser, createUser, createOwnerUser } = require('../controllers/users');
const verifyToken = require('../middlewares/verifyToken.js');
//Want to protect the get user endpoint

router.get('/', verifyToken, getUser);
router.post('/', createUser);
router.post('/owner', createOwnerUser);

module.exports = router;