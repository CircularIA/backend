const router = require('express').Router();

const { createUser, createOwnerUser } = require('../controllers/users');

router.post('/', createUser);
router.post('/owner', createOwnerUser);

module.exports = router;