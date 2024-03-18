import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Shared } from './entities/shared.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Shared])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
