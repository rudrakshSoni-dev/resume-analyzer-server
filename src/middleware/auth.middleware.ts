import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface JwtPayload {
  userId: string;
}

const COOKIE_NAME = "token";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    return res.sendStatus(401);
  }
}

export const protect = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1️⃣ Check cookie first
    if (req.cookies?.[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    // 2️⃣ Check Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 4️⃣ Find user in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

