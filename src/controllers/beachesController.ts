import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { authMiddleware } from '@src/middlewares/authMiddleware';
import { Beach } from '@src/models/Beach';

import { BaseController } from './baseController';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export default class BeachesController  extends BaseController {
  /**
   * @tag Beaches
   * @security apiKey
   * @summary Create a new Beach.
   * @description Create a new Beach belonging to the authenticated user
   * @bodyContent {Beach} application/json
   * @bodyRequired
   * @response 201 - The Beach has been created
   * @responseContent {BeachCreatedResponse} 201.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
  */

  @Post('')
  public async create(request: Request, response: Response): Promise<void> {
    try {
      const beach = new Beach({ 
        ...request.body, 
        ...{ userId: request.decoded?.id } 
      });

      const result = await beach.save();
      
      response.status(httpStatus.CREATED).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(response, error);
    }
  }
}
