import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        next(err);
        return;
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    if (statusCode >= 500) console.error(err);

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500 && process.env.NODE_ENV === "production"
                ? "Something went wrong"
                : err.message,
    });
};

export default errorHandler;
