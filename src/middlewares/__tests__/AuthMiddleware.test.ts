import httpStatus from 'http-status-codes';

import AuthService from '@src/services/AuthService';

import { authMiddleware } from '../authMiddleware';

describe('Auth Middleware test', () => {
  it('should be able to verify a JWT token and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    
    const resFake = {};

    const nextFake = jest.fn();
    
    authMiddleware(reqFake, resFake, nextFake);
    
    expect(nextFake).toHaveBeenCalled();
  });

  it('should be able to return 401 if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid token',
      },
    };

    const sendMock = jest.fn();
    
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    
    const nextFake = jest.fn();
    
    authMiddleware(reqFake, resFake as object, nextFake);
    
    expect(resFake.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(sendMock).toHaveBeenCalledWith({
      code: httpStatus.UNAUTHORIZED,
      error: 'jwt malformed',
    });
  });

  it('should be able to return 401 middleware if theres no token', () => {
    const reqFake = {
      headers: {},
    };

    const sendMock = jest.fn();
    
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    
    const nextFake = jest.fn();
    
    authMiddleware(reqFake, resFake as object, nextFake);
    
    expect(resFake.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(sendMock).toHaveBeenCalledWith({
      code: httpStatus.UNAUTHORIZED,
      error: 'jwt must be provided',
    });
  });
});