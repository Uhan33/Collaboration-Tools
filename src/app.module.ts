import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';
import { CommentModule } from './comment/comment.module';
import { CardModule } from './card/card.module';
import { BoardModule } from './board/board.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from './user/entities/user.entity';
import { Shared } from './user/entities/shared.entity';
import { Board } from './board/entities/board.entity';
import { List } from './list/entities/list.entity';
import Joi from 'joi';
import { Comment } from './comment/entities/comment.entity';
import { Card } from './card/entities/card.entity';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, Shared, Board, Comment, List, Card], // 엔티티는 반드시 여기에 명시!
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
  TypeOrmModule.forRootAsync(typeOrmModuleOptions),
  UserModule, 
  BoardModule, 
  CardModule, 
  CommentModule, 
  ListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
