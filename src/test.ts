import prisma from "./prisma/client";

async function test() {
  const user = await prisma.user.create({
    data: {
      name: "Test",
      email: "test@test.com",
      password: "123"
    }
  });

  console.log(user);
}

test();
