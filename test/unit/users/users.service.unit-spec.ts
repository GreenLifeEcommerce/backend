import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { User } from '../../../src/users/entities/user.entity';
import { UsersService } from '../../../src/users/users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  describe('getMe', () => {
    it('should return a user with the specified ID', async () => {
      const userId = '64f8a8b8e4b0a1a1a1a1a1a1';
      const user = {
        _id: userId,
        email: 'test@email.com',
        password: 'hashed-password',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          email: 'test@email.com',
          password: 'hashed-password',
          name: undefined,
        }),
      };

      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await usersService.getMe(userId);

      expect(result).toEqual({
        _id: userId,
        email: 'test@email.com',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw a BadRequestException if user is not found', async () => {
      const userId = '64f8a8b8e4b0a1a1a1a1a1a1';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      await expect(usersService.getMe(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
