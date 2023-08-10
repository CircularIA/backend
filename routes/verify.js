const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.get('/', (req, res) => {
    console.log('Cookies:', req.cookies); // Verificar las cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).send(false);

    try {
        jwt.verify(token, process.env.JWT_KEY);
        res.send(true);
    } catch (err) {
        console.log('Error verifying token:', err); // Verificar cualquier error
        res.status(401).send(false);
    }
});


module.exports = router;