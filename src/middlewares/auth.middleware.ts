import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/enums.js";

export class AuthMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // 1️⃣ Ambil dari Authorization header
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // 2️⃣ Jika tidak ada di header, ambil dari cookies
      if (!token) {
        token = req.cookies?.accessToken;
      }

      if (!token) {
        return next(new ApiError("No token provided", 401));
      }

      try {
        const payload = jwt.verify(token, secretKey);
        res.locals.user = payload;
        next();
      } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
          return next(new ApiError("Token expired", 401));
        }

        return next(new ApiError("Token invalid", 401));
      }
    };
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
