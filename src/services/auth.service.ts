import prisma from "../prisma/client";
import bcrypt from "bcrypt";

export async function createUser(name: string, email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
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
