import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
} from "../services/auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // ⭐ hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser(name, email, hashedPassword);

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
}


export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // ⭐ compare hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // ⭐ set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME);
  return res.json({ message: "Logged out successfully" });
}
