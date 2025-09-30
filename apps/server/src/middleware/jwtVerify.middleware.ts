import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT payload interface
export interface JwtPayload {
  id: string | number;
  username: string;
  email: string;
  iat?: number;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader =
    req.headers["authorization"] || req.headers["authorisation"];
  const token = Array.isArray(authHeader)
    ? authHeader[0]?.split(" ")[1]
    : authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided or invalid format" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not set");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
