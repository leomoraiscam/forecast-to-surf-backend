import ApiError from '../ApiError';
import httpStatus from 'http-status-codes';

describe('ApiError', () => {
  it('should be able to format error with mandatory fields', () => {
    const error = ApiError.format({ code: 404, message: 'User not found!' });
    
    expect(error).toEqual({
      message: 'User not found!',
      error: 'Not Found',
      code: httpStatus.NOT_FOUND,
    });
  });
  
  it('should be able to format error with mandatory fields and description', () => {
    const error = ApiError.format({
      code: httpStatus.NOT_FOUND,
      message: 'User not found!',
      description: 'This error happens when there is no user created',
    });

    expect(error).toEqual({
      message: 'User not found!',
      error: 'Not Found',
      code: httpStatus.NOT_FOUND,
      description: 'This error happens when there is no user created',
    });
  });
  
  it('should be able to format error with mandatory fields and description and documentation', () => {
    const error = ApiError.format({
      code: httpStatus.NOT_FOUND,
      message: 'User not found!',
      description: 'This error happens when there is no user created',
      documentation: 'https://mydocs.com/error-404',
    });

    expect(error).toEqual({
      message: 'User not found!',
      error: 'Not Found',
      code: httpStatus.NOT_FOUND,
      description: 'This error happens when there is no user created',
      documentation: 'https://mydocs.com/error-404',
    });
  });
})