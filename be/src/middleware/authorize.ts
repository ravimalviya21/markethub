import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import STATUS_CODES from "../contants/statusCode";
import { AuthUser, UserRole } from "../types/models";

// Gate a route by role. Runs after `authenticate` (which sets req.user).
// usage: authorize("admin")  |  authorize("admin", "seller")
const authorize =
    (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as AuthUser | undefined;
        if (!user) {
            throw new AppError("Unauthorized - no user", STATUS_CODES.UNAUTHORIZED);
        }
        if (!user.role || !allowedRoles.includes(user.role)) {
            throw new AppError("Forbidden - insufficient permissions", STATUS_CODES.FORBIDDEN);
        }
        next();
    };

export default authorize;
