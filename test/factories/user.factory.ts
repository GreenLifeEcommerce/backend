import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from '../../src/users/entities/user.entity';

export class UserFactory {
  private userModel: Model<UserDocument>;

  static new(userModel: Model<UserDocument>) {
    const factory = new UserFactory();
    factory.userModel = userModel;
    return factory;
  }

  async create(user: Partial<User> = {}) {
    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(user.password || 'Pass#123', salt);
    return this.userModel.create({
      email: user.email,
      password,
      ...(user.name ? { name: user.name } : {}),
    });
  }

  private hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}
