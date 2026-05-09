const { ZodError } = require("zod");
const STATUS_CODES = require("../contants/statusCode");

// source = 'body' | 'query' | 'params'
const validate = (schema, source = "body") => (req, res, next) => {
    try {
        req[source] = schema.parse(req[source]);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                error: "ValidationError",
                issues: err.issues.map((i) => ({
                    path: i.path.join("."),
                    message: i.message,
                })),
            });
        }
        next(err);
    }
};

module.exports = validate;
