const { AppError } = require("../utils/errors");
const verifyToken = require("../utils/tokens");


const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
    }

    const token = header.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new AppError('Token expired, please refresh', 401);
        }
        throw new AppError('Invalid token', 401);
    }
};

module.exports = authenticate
