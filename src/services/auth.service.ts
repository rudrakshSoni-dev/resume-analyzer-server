// src/services/auth.service.ts

import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function loginUser(data: LoginData) {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(
    data.password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function logoutUser(){
  return{
    message: "Logout Successful"
  }
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function comparePassword(
  plain: string,
  hashed: string
) {
  return bcrypt.compare(plain, hashed);
}

function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}
