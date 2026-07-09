import bcrypt from "bcrypt";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "@/src/config";
import { jwt_utils } from "@/src/utils/jwt";
import { prisma } from "@/src/lib/prisma";
import type { Role, user } from "@/generated/prisma/client";

type UserRoleWithoutAdmin = Exclude<Role, "ADMIN">;
type RegisterPayload = Omit<
  user,
  "id" | "createdAt" | "updatedAt" | "status" | "role"
> & {
  role: UserRoleWithoutAdmin;
};

const register = async (payload: RegisterPayload) => {
  const { name, email, password, avatarUrl, role } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.BCRYPT_SALT_ROUNDS),
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatarUrl,
      role,
    },
    omit: { password: true },
  });

  return user;
};

const login = async (payload: Pick<user, "email" | "password">) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwt_utils.createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    (config.JWT_ACCESS_EXPIRES_IN as string).replace(",", "").trim(),
  );

  const refreshToken = jwt_utils.createToken(
    jwtPayload,
    config.JWT_REFRESH_SECRET as string,
    (config.JWT_REFRESH_EXPIRES_IN as string).replace(",", "").trim(),
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (refreshToken: string) => {
  const token = jwt_utils.verifyToken(
    refreshToken,
    config.JWT_REFRESH_SECRET as string,
  );

  if (!token.success) {
    throw new Error(token.error);
  }

  const { id } = token.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }
  if (user.status === "SUSPENDED") {
    throw new Error("User is blocked!");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt_utils.createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    (config.JWT_ACCESS_EXPIRES_IN as string).replace(",", "").trim(),
  );
  return { accessToken };
};

const profile = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    omit: { password: true, id: true },
  });
  return user;
};

const updateProfile = async (
  payload: Pick<user, "email" | "name" | "avatarUrl">,
) => {
  const { email, name, avatarUrl } = payload;
  const user = await prisma.user.update({
    where: { email },
    data: {
      name,
      avatarUrl,
    },
  });
  return user;
};

export const authService = {
  register,
  login,
  refreshToken,
  profile,
  updateProfile,
};
