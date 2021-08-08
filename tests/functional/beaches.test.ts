import httpStatus from "http-status-codes";

import { Beach } from '@src/models/Beach';
import { User } from '@src/models/User';
import AuthService from '@src/services/AuthService';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser).save();
    
    token = AuthService.generateToken(user.toJSON());
  });

  afterAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
  });

  describe ('When creating a beach', () => {
    it('should be able to create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toEqual(expect.objectContaining(newBeach))
    });

    it('should be able to return validation error when a field is invalid', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        error: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      })
    });

    it('should be able to return 500 when there is a unexpected database error', async () => {
      jest
        .spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject('fail to create beach'));
      const newBeach = {
        lat: -33.792726,
        lng: 46.43243,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .send(newBeach)
        .set({ 'x-access-token': token });

      expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        code: httpStatus.INTERNAL_SERVER_ERROR,
        error: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
        message: 'Something went wrong!',
      });
    });
  })
})