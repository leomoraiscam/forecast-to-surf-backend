import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/model/user';
import { BaseController } from '.';

@Controller('users')
export class UsersController extends BaseController{
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);

      const result = await user.save();
      
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error)
    }
  }
}
