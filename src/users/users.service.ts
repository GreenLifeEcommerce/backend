import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getMe(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const plainUser = user.toObject();
      const { password, ...rest } = plainUser;
      return {
        ...rest,
        _id: rest._id.toString(),
      } as unknown as User;
    } catch (error) {
      throw new BadRequestException('Invalid user ID format');
    }
  }
}
