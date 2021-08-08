import { Request, Response, NextFunction } from 'express';
import ApiError from '@src/utils/errors/ApiError';

export interface HTTPError extends Error {
  status?: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function apiErrorValidator(
  error: HTTPError,
  _: Partial<Request>,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __: NextFunction
  ): void {
    const errorCode = error.status || 500;
    res
      .status(errorCode)
      .json(ApiError.format({ code: errorCode, message: error.message }));
  }