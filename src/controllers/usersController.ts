import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { authMiddleware } from '@src/middlewares/authMiddleware';
import { User } from '@src/models/User';
import AuthService from '@src/services/AuthService';

import { BaseController } from './baseController';

@Controller('users')
export default class UsersController extends BaseController {
  /**
   * @tag Users
   * @summary Creates a user.
   * @description Create a new User
   * @bodyContent {User} application/json
   * @bodyRequired
   * @response 201 - The user has been created
   * @responseContent {UserCreatedResponse} 201.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
  */
  @Post('')
  public async create(request: Request, response: Response): Promise<void> {
    try {
      const user = new User(request.body);

      const result = await user.save();
      
      response.status(httpStatus.CREATED).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(response, error)
    }
  }

  /**
   * @tag Users
   * @summary Authenticate the user on API.
   * @description Authenticate the user on the API generating a JWT token
   * @bodyContent {UserAuth} application/json
   * @bodyRequired
   * @response 200 - The user has been authenticate and the JWT returned
   * @responseContent {AuthenticatedUserResponse} 200.application/json
   * @response 400 - Invalid parameters
   * @responseContent {Error} 400.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
  */
  @Post('authenticate')
  public async authenticate(
    request: Request, 
    response: Response
  ): Promise<Response> {
    const user = await User.findOne({ email: request.body.email });

    if (!user) {
      return this.sendErrorResponse(response, {
        code: httpStatus.UNAUTHORIZED,
        message: 'User not found!',
        description: 'Try verifying your email address.',
      });
    }

    if (
      !(await AuthService.comparePasswords(request.body.password, user.password))
    ) {
      return this.sendErrorResponse(response, {
        code: httpStatus.UNAUTHORIZED,
        message: 'Password does not match!',
      });
    }

    const token = AuthService.generateToken(user.toJSON());

    return response.send({ ...user.toJSON(), ...{ token } });
  }

  /**
   * @security apiKey
   * @tag Users
   * @summary Get the profile of the authenticated user.
   * @description Get the profile of the token's owner
   * @response 200 - The user information
   * @responseContent {UserProfileResponse} 200.application/json
   * @response 404 - Not Found
   * @responseContent {NotFoundError} 404.application/json
   * @response 401 - Unauthorized
   * @responseContent {AuthenticationError} 401.application/json
   * @response 500 - Internal Server Error
   * @responseContent {InternalServerError} 500.application/json
  */
  @Get('me')
  @Middleware(authMiddleware)
  public async getUserInformationFromToken(
    request: Request, 
    response: Response
  ): Promise<Response> {
    const email = request.decoded ? request.decoded.email : undefined;

    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(response, {
        code: httpStatus.NOT_FOUND,
        message: 'User not found!',
      });
    }

    return response.send({ user });
  }
}
