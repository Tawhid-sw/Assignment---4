import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string | number,
) => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret) as JwtPayload;
    if (!verifiedToken) throw new Error("Invalid token");
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (err) {
    const error = err as Error;
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwt_utils = {
  createToken,
  verifyToken,
};
