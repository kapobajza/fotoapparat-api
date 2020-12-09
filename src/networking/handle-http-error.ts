import { Response } from 'express';

import Config from '../config';

export class HttpError extends Error {
  message: string;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message ?? Config.DEFAULT_MESSAGE);

    this.message = message ?? Config.DEFAULT_MESSAGE;
    this.statusCode = statusCode;
  }
}

export const handleHttpError = (res: Response, error: HttpError) => {
  const { message, statusCode, stack } = error;

  let errorObj: { [key: string]: any } = { message };

  if (Config.IS_DEV_ENV) {
    errorObj = { ...errorObj, stack };
  }

  res.status(statusCode ?? 500).json(errorObj);
};
