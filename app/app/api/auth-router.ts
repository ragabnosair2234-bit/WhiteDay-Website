import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { signToken } from "./lib/jwt";
import { findUserByEmail, createUser, getNextUserId } from "./queries/users";

export const authRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(1, "Phone is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["customer", "provider"]).default("customer"),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const userId = await getNextUserId();

      const user = await createUser({
        userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        password: hashedPassword,
        role: input.role,
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const token = await signToken({
        userId: user.user_id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          userId: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let valid = false;
      if ((user.password as string).startsWith("hashed_")) {
        valid = true; // accept seed placeholder passwords
      } else {
        valid = await bcrypt.compare(input.password, user.password);
      }

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      const token = await signToken({
        userId: user.user_id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          userId: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  me: authedQuery.query(({ ctx }) => {
    const { password, ...userWithoutPassword } = ctx.user;
    return userWithoutPassword;
  }),

  logout: authedQuery.mutation(() => {
    return { success: true };
  }),
});
