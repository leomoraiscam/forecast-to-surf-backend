import bcrypt from 'bcryptjs';
import config from 'config';
import jwt from 'jsonwebtoken';

import IAuthConfig from '@src/dtos/IAuthConfigDTO';
import { User } from '@src/models/User';

const authConfig: IAuthConfig = config.get('App.auth');

export interface DecodedUser extends Omit<User, '_id'> {
  id: string;
}

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(payload: object): string {
    const { secret, expiresIn } = authConfig;

    return jwt.sign(payload, secret, {
      expiresIn
    });
  }

  public static decodeToken(token: string): DecodedUser {
    const { secret } = authConfig;

    return jwt.verify(token, secret) as DecodedUser;
  }
}