import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/model/user';

@Controller('users')
export class UsersController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);

      const result = await user.save();
      
      res.status(201).send(result);
    } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
