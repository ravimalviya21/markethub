import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};

export default asyncHandler;
