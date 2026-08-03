import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, ZodType } from "zod";
import STATUS_CODES from "../contants/statusCode";

type ValidationSource = "body" | "query" | "params";

// source = 'body' | 'query' | 'params'
const validate = (schema: ZodType, source: ValidationSource = "body"): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[source]);
            if (source === "query") {
                req.validatedQuery = parsed;
            } else {
                (req as unknown as Record<ValidationSource, unknown>)[source] = parsed;
            }
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
};

export default validate;
