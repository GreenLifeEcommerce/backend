import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';

import { User } from '../../../src/users/entities/user.entity';
import { UsersService } from '../../../src/users/users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getMe', () => {
    it('should return a user with the specified ID', async () => {
      const userId = new ObjectId().toString();
      const user = new User();
      user.id = new ObjectId(userId);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await usersService.getMe(userId);

      expect(result).toEqual(user);
    });

    it('should throw a BadRequestException if user is not found', async () => {
      const userId = new ObjectId().toString();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(usersService.getMe(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
