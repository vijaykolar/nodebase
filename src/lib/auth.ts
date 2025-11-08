import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import prisma from "./db";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
