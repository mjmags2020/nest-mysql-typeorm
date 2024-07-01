import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './typeorm/entities/User';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './typeorm/entities/Profile';
import { Post } from './typeorm/entities/Post';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env` }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: +process.env.PORT,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DB,
      entities: [User, Profile, Post],
      synchronize: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
