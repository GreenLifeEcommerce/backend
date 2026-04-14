import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: true, // MongoDB synchronize sẽ tự tạo collection
        logging: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
