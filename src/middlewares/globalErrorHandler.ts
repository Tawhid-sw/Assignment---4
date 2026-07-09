import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "@/generated/prisma/client";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error : ", err);

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorDetails: unknown = null;

  if (err instanceof Error) {
    message = err.message || message;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "You have provided an incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Duplicate value — this record already exists";
      errorDetails = { field: err.meta?.target ?? null };
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message =
        "This record is still referenced by other data and cannot be deleted or updated";
      errorDetails = { field: err.meta?.field_name ?? null };
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "The requested record was not found";
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database request error";
      errorDetails = { code: err.code };
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      message =
        "Authentication failed against database server. Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.SERVICE_UNAVAILABLE;
      message = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Error occurred during query execution";
  } else if (err instanceof Error) {
    const msg = err.message;

    if (
      msg.includes("violates RESTRICT setting of foreign key constraint") ||
      msg.includes("foreign key constraint")
    ) {
      statusCode = httpStatus.BAD_REQUEST;
      message =
        "This record is still referenced by other data and cannot be deleted or updated";
      errorDetails = { hint: "Remove or reassign dependent records first" };
    } else if (msg.includes("duplicate key value violates unique constraint")) {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Duplicate value — this record already exists";
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails,
  });
};
