import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { AppModule } from 'src/app.module';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { IORedisKey } from '../../src/redis/redis.constants';

export class AppFactory {
  private constructor(
    private readonly appInstance: INestApplication,
    private readonly connection: Connection,
    private readonly redis: Redis,
  ) {}

  get instance() {
    return this.appInstance;
  }

  static async new() {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();

    app.useGlobalInterceptors(new TransformInterceptor());

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
        stopAtFirstError: true,
        validateCustomDecorators: true,
      }),
    );

    await app.init();

    const connection = module.get<Connection>(getConnectionToken());
    const redis = module.get<Redis>(IORedisKey);

    return new AppFactory(app, connection, redis);
  }

  async close() {
    await this.appInstance.close();
  }

  async cleanupDB() {
    await this.redis.flushall();
    const collections = this.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
