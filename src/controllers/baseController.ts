import mongoose  from "mongoose";
import { Response } from "express";
import httpStatus from 'http-status-codes';

import { CUSTOM_VALIDATION } from "@src/models/User";
import ApiError, { APIError } from '@src/utils/errors/ApiError';

import logger from '@src/logger';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    response: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      
      response.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);

      response
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send(ApiError.format({ 
          code: httpStatus.INTERNAL_SERVER_ERROR, 
          message: 'Something went wrong!' 
        }));
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.message === CUSTOM_VALIDATION.DUPLICATED
    );

    if (duplicatedKindErrors.length) {
      return {
        code: httpStatus.CONFLICT,
        error: error.message,
      };
    }

    return { code: httpStatus.CONFLICT, error: error.message };
  }

  protected sendErrorResponse(
    response: Response, 
    apiError: APIError
  ): Response {
    return response
      .status(apiError.code)
      .send(ApiError.format(apiError));
  }
}