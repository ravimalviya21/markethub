import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifyToken } from "../utils/tokens";
import { AuthUser } from "../types/models";

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError("No token provided", 401);
    }

    const token = header.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded as unknown as AuthUser; // { id, email, role }
        next();
    } catch (err) {
        if (err instanceof Error && err.name === "TokenExpiredError") {
            throw new AppError("Token expired, please refresh", 401);
        }
        throw new AppError("Invalid token", 401);
    }
};

export default authenticate;
