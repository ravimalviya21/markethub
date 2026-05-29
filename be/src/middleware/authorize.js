const { AppError } = require("../utils/errors");
const STATUS_CODES = require("../contants/statusCode");

// Gate a route by role. Runs after `authenticate` (which sets req.user).
// usage: authorize("admin")  |  authorize("admin", "seller")
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        throw new AppError("Unauthorized - no user", STATUS_CODES.UNAUTHORIZED);
    }
    if (!allowedRoles.includes(req.user.role)) {
        throw new AppError("Forbidden - insufficient permissions", STATUS_CODES.FORBIDDEN);
    }
    next();
};

module.exports = authorize;
