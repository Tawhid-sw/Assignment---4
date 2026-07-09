import type { Response } from "express";

type ResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export const sendResponse = <T>(res: Response, data: ResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  });
};
