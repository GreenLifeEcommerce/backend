import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import jwtConfig from '../common/config/jwt.config';
import { MongoErrorCode } from '../common/enums/error-codes.enum';
import { ActiveUserData } from '../common/interfaces/active-user-data.interface';
import { RedisService } from '../redis/redis.service';
import { User, UserDocument } from '../users/entities/user.entity';
import { BcryptService } from './bcrypt.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redisService: RedisService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password, name } = signUpDto;

    try {
      const hashedPassword = await this.bcryptService.hash(password);
      const user = new this.userModel({
        email,
        name,
        password: hashedPassword,
      });
      await user.save();
    } catch (error) {
      if ((error as any).code === MongoErrorCode.UniqueViolation) {
        throw new ConflictException(`User [${email}] already exist`);
      }
      throw error;
    }
  }

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const isPasswordMatch = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid password');
    }

    return await this.generateTokens(user);
  }

  async signOut(userId: string): Promise<void> {
    await this.redisService.delete(`user-${userId}`);
    await this.redisService.delete(`refresh-token-${userId}`);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        refreshToken,
        this.jwtConfiguration,
      );

      const isValidToken = await this.redisService.validate(
        `refresh-token-${payload.id}`,
        refreshToken,
      );

      if (!isValidToken) {
        throw new UnauthorizedException('Refresh token is invalid');
      }

      const user = await this.userModel.findById(payload.id).exec();

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenId = randomUUID();
    const userId = user._id.toString();

    const payload: ActiveUserData = {
      id: userId,
      email: user.email,
      name: user.name,
      tokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.accessTokenTtl as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.refreshTokenTtl as any,
      }),
    ]);

    await this.redisService.insert(`user-${userId}`, tokenId);
    await this.redisService.insert(`refresh-token-${userId}`, refreshToken);

    return { accessToken, refreshToken };
  }
}
