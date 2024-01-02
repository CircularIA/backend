import jwt from 'jsonwebtoken';


export default function verifyToken(req, res, next) {
  //Bearer TOKEN
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);  // if there isn't any token

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) return res.status(403).send({ message: 'Invalid Token' });
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}