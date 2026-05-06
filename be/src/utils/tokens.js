const jwt = require('jsonwebtoken');
require("dotenv").config();

const generateAccessToken = (user) => {
    return jwt.sign(
        {name : user.name, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
    return jwt.verify(token, secret);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };