import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  findUserByEmail,
  registerUser,
  logoutUser,
  comparePassword,
  loginUser
} from "../services/auth.service";
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    // const { name, email, password } = req.body;

    // const existing = await findUserByEmail(email);

    // if (existing)
    //   return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // const user = await createUser(name, email, hashedPassword);

    // res.status(201).json({
    //   id: user.id,
    //   email: user.email,
    // });
    const result = await registerUser(req.body);

    res.status(201).json(result);

  } catch(error: any) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
}


export async function login(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({email: email, password: password});

    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Login failed",
    });
  }
}

export async function logout(
  req: Request,
  res: Response,
) {
  try {
    await logoutUser();
    res.clearCookie(COOKIE_NAME);
    return res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}