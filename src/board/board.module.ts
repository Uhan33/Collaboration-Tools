import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Shared } from 'src/user/entities/shared.entity';
import { MailService } from 'src/utils/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, User, Shared])],
  controllers: [BoardController],
  providers: [BoardService, MailService],
  exports: [BoardService, MailService],
})
export class BoardModule {}
