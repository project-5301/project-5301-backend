const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const secret = process.env.SECRETKEY;
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, isProvider: user.isProvider },
        secret,
        { expiresIn: '1h' }
    );
};

module.exports = { generateToken };

