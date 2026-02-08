import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/enums.js";

export class AuthMiddleware {
    verifyToken = (SecretKey : string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) throw new ApiError ("Token not found", 401);

            jwt.verify(token,SecretKey, (err, payload) => {
                if (err){
                    if (err instanceof jwt.TokenExpiredError) {
                        throw new ApiError("Token expired", 401);
                    }else {
                        throw new ApiError("Invalid token", 401);
                    }
                }

                res.locals.user=payload;
                next();
            });
        }
    };

    verifyRole = (roles: Role[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const userRole = res.locals.user.role;

            if (!userRole || !roles.includes(userRole)) {
                throw new ApiError("you don't have access to this resource", 401);
            }
            next();
        };
    };
}