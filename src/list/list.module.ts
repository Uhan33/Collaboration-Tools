import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { List } from './entities/list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/card/entities/card.entity';
import { Board } from 'src/board/entities/board.entity';
import { BoardService } from 'src/board/board.service';
import { Shared } from 'src/user/entities/shared.entity';
import { User } from 'src/user/entities/user.entity';
import { MailService } from 'src/utils/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([List, Card, Board, User, Shared])],
  controllers: [ListController],
  providers: [ListService, BoardService, MailService],
})
export class ListModule {}
