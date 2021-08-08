import { ClassMiddleware, Controller, Get, Middleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { authMiddleware } from '@src/middlewares/authMiddleware';
import { rateLimiterMiddleware } from '@src/middlewares/rateLimiterMiddleware';
import { Beach } from '@src/models/Beach';
import { ForecastService } from '@src/services/ForecastService';

import { BaseController } from './baseController';

import logger from '@src/logger';

const forecastService = new ForecastService();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export default class ForecastController extends BaseController {
  /**
   * @tag Beaches
   * @security apiKey
   * @summary Get the list of forecast.
   * @description Get the list of forecast ordered by the most ranked
   * @response 200 - The list of forecast has been returned
   * @responseContent {TimeForecast} 200.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 429 - Too Many Requests
   * @responseContent {TooManyRequestsError} 429.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
  */

  @Get('')
  @Middleware(rateLimiterMiddleware({}))
  public async getForecastLoggedUser(
    request: Request, 
    response: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ userId: request.decoded?.id });
      
      const forecastData = await forecastService.processForecastForBeaches(beaches);
      
      response.status(httpStatus.OK).send(forecastData);
    } catch (error) {
      logger.error(error);

      this.sendErrorResponse(response, {
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      });
    }
  }
}
