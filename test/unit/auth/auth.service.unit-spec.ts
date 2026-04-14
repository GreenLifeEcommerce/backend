import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { AuthService } from '../../../src/auth/auth.service';
import { BcryptService } from '../../../src/auth/bcrypt.service';
import { SignInDto } from '../../../src/auth/dto/sign-in.dto';
import { SignUpDto } from '../../../src/auth/dto/sign-up.dto';
import jwtConfig from '../../../src/common/config/jwt.config';
import { MongoErrorCode } from '../../../src/common/enums/error-codes.enum';
import { RedisService } from '../../../src/redis/redis.service';
import { User } from '../../../src/users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let bcryptService: BcryptService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            insert: jest.fn(),
            delete: jest.fn(),
            validate: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'secret',
            accessTokenTtl: 3600,
            refreshTokenTtl: 86400,
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    bcryptService = module.get<BcryptService>(BcryptService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    redisService = module.get<RedisService>(RedisService);
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      email: 'test@email.com',
      password: 'password',
      passwordConfirm: 'password',
    };

    const user = new User();
    user.email = signUpDto.email;
    user.password = 'hashedPassword';

    beforeEach(() => {
      jest.spyOn(bcryptService, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
    });

    it('should create a new user', async () => {
      await authService.signUp(signUpDto);

      expect(bcryptService.hash).toHaveBeenCalledWith(signUpDto.password);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw a ConflictException if a user with the same email already exists', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValue({
        code: MongoErrorCode.UniqueViolation,
      });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@email.com',
      password: 'password',
    };

    const user = new User();
    user.id = new ObjectId();
    user.email = signInDto.email;
    user.password = 'hashedPassword';

    it('should sign in a user and return tokens', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await authService.signIn(signInDto);

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });
    });
  });

  describe('signOut', () => {
    it('should delete user tokens from Redis', async () => {
      const userId = '123';
      await authService.signOut(userId);

      expect(redisService.delete).toHaveBeenCalledWith(`user-${userId}`);
      expect(redisService.delete).toHaveBeenCalledWith(
        `refresh-token-${userId}`,
      );
    });
  });
});
