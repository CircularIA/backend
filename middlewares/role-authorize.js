import jwt from 'jsonwebtoken';


export default function checkRole (roles) {
    return function (req, res, next) {
        //Recibir el token a traves de los headers
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).send('Access Denied');
        try {
            const verified = jwt.verify(token, process.env.JWT_KEY);
            if (roles.includes(verified.role)) {
                req.user = verified;
                next();
            } else {
                return res.status(401).send('Access Denied');
            }
        } catch (error) {
            return res.status(400).send('Invalid Token');
        }
    }
}