import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { Server } from 'http';
import { Model } from 'mongoose';

import { AppFactory } from '../factories/app.factory';
import { AuthService } from '../../src/auth/auth.service';
import { SignUpDto } from '../../src/auth/dto/sign-up.dto';
import { UserFactory } from '../factories/user.factory';
import { SignInDto } from '../../src/auth/dto/sign-in.dto';
import { User, UserDocument } from '../../src/users/entities/user.entity';

describe('App (e2e)', () => {
  let app: AppFactory;
  let server: Server;
  let userModel: Model<UserDocument>;
  let authService: AuthService;

  beforeAll(async () => {
    app = await AppFactory.new();
    server = app.instance.getHttpServer();
    userModel = app.instance.get(getModelToken(User.name));
    authService = app.instance.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.cleanupDB();
  });

  describe('AppModule', () => {
    describe('GET /', () => {
      it("should return 'Hello World'", () => {
        return request(server)
          .get('/')
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.data).toBe('Hello World!');
          });
      });
    });
  });

  describe('AuthModule', () => {
    describe('POST /auth/sign-up', () => {
      it('should create a new user', async () => {
        const signUpDto: SignUpDto = {
          email: 'atest@email.com',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED);
      });

      it('should return 400 for invalid sign up fields', async () => {
        const signUpDto: SignUpDto = {
          email: 'invalid-email',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 409 if user already exists', async () => {
        await UserFactory.new(userModel).create({
          email: 'atest@email.com',
          password: 'Pass#123',
        });

        const signUpDto: SignUpDto = {
          email: 'atest@email.com',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CONFLICT);
      });
    });

    describe('POST /auth/sign-in', () => {
      it('should sign in the user and return access token', async () => {
        const email = 'atest@email.com';
        const password = 'Pass#123';
        await UserFactory.new(userModel).create({
          email,
          password,
        });

        const signInDto: SignInDto = { email, password };

        return request(server)
          .post('/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.data).toEqual({
              accessToken: expect.any(String),
            });
          });
      });

      it('should return 400 for invalid sign in fields', async () => {
        const signInDto: SignInDto = {
          email: 'atest@email.com',
          password: '',
        };

        return request(server)
          .post('/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('POST /auth/sign-out', () => {
      it('should sign out the user', async () => {
        const user = await UserFactory.new(userModel).create({
          email: 'atest@email.com',
          password: 'Pass#123',
        });

        const { accessToken } = await authService.generateTokens(user);

        return request(server)
          .post('/auth/sign-out')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);
      });

      it('should return 401 if not authorized', async () => {
        return request(server)
          .post('/auth/sign-out')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('UsersModule', () => {
    describe('GET /users/me', () => {
      it('should return 401 unauthorized when no access token provided', () => {
        return request(server).get('/users/me').expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return user details when access token provided', async () => {
        const user = await UserFactory.new(userModel).create({
          email: 'atest@email.com',
          password: 'Pass#123',
        });

        const { accessToken } = await authService.generateTokens(user);

        return request(server)
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.data).toEqual(
              expect.objectContaining({
                _id: user._id.toString(),
                email: user.email,
              }),
            );
            expect(res.body.data).not.toHaveProperty('password');
          });
      });
    });
  });
});
