import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/tokens";
import { AuthUser } from "../types/models";

const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        next();
        return;
    }

    try {
        const decoded = verifyToken(header.split(" ")[1]);
        req.user = decoded as unknown as AuthUser;
    } catch {
        req.user = undefined;
    }
    next();
};

export default optionalAuthenticate;
