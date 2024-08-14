const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const secret = process.env.SECRETKEY;
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
