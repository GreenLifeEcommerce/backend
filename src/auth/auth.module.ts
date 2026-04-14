import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { BcryptService } from './bcrypt.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  providers: [AuthService, BcryptService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
