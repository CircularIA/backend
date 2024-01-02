import jwt from 'jsonwebtoken';


export default function checkRole (roles) {
    return function (req, res, next) {
        const token = req.cookies.token;
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