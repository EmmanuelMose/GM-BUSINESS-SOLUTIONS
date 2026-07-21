import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export const checkRoles = (requiredRole: "admin" | "staff" | "customer") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            (req as any).user = decoded;

            if (typeof decoded === "object" && decoded !== null && "role" in decoded) {
                if (decoded.role === requiredRole) {
                    next();
                    return;
                }
                res.status(401).json({ message: "Unauthorized" });
                return;
            } else {
                res.status(401).json({ message: "Invalid Token Payload" });
                return;
            }
        } catch (error) {
            res.status(401).json({ message: "Invalid Token" });
            return;
        }
    };
};

// NEW: Middleware that only verifies the token, no role check
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
        return;
    }
};
export const adminRoleAuth = checkRoles("admin");
export const staffRoleAuth = checkRoles("staff");
export const customerRoleAuth = checkRoles("customer");