import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", {
      type: "User",
    });
  },
});

export const SignupMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        name: nonNull(stringArg()),
      },
      async resolve(parent, args, context, info) {
        const { email, password, name } = args;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await context.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
          },
        });

        const token = jwt.sign(
          { userId: user.id },
          context.authEnv.JWT_APP_SECRET
        );

        return {
          user,
          token,
        };
      },
    });
  },
});

export const LoginMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(parent, args, context, info) {
        const { email, password } = args;

        const user = await context.prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("Authentication error");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Authentication error");
        }

        const token = jwt.sign(
          { userId: user.id },
          context.authEnv.JWT_APP_SECRET
        );

        return {
          user,
          token,
        };
      },
    });
  },
});
