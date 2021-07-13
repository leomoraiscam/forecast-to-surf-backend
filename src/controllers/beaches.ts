import { Request, Response } from 'express';
import { Controller, Post } from '@overnightjs/core';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    res.status(201).send(req.body);
  }
}
