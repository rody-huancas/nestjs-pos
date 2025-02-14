import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASS'),
  database: configService.get('DATABASE_NAME'),

  // ssl: true,
  // logging: true,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
});
