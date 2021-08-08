import httpStatus from 'http-status-codes';

import {  User } from "@src/models/User"
import AuthService from '@src/services/AuthService';

describe('Users functional tests', () => {
  beforeEach(async() => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('when creating a user', () => {
    it('should be able to successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John doe',
        email: 'joh@email.com',
        password: '1234'
      };

      const response = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(response.status).toBe(httpStatus.CREATED);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser, 
          ...{password: expect.any(String)}
        })
      )
    });

    it('Should be able to return a validation error when a field is missing', async () => {
      const newUser = {
        email: 'joh@email.com',
        password: '1234'
      };

      const response = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        error: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it.skip('Should return 409 when the email already exists', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'Conflict',
        message:
          'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('when authenticating a user', () => {
    it('should be able to generate a token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new User(newUser).save();
      
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ 
          email: newUser.email, 
          password: newUser.password 
        });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
    
    it('Should be able to return 401 if the user with the given email is not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ 
          email: 'some-email@mail.com', 
          password: '1234' 
        });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should be able to return 401 if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await new User(newUser).save();
      
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ 
          email: newUser.email, 
          password: 'different password' 
        });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When getting user profile info', () => {
    it(`Should be able to return the token's owner profile information`, async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user.toJSON());
      
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(httpStatus.OK);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it(`Should be able to return 404 when the user is not found`, async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const user = new User(newUser);

      const token = AuthService.generateToken(user.toJSON());
      
      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(httpStatus.NOT_FOUND);
      expect(body.message).toBe('User not found!');
    });
  });
})