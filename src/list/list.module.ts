import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { List } from './entities/list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from 'src/card/entities/card.entity';
import { Board } from 'src/board/entities/board.entity';
import { BoardService } from 'src/board/board.service';
import { User } from 'src/user/entities/user.entity';
import { Shared } from 'src/user/entities/shared.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List, Card, Board, User, Shared])],
  controllers: [ListController],
  providers: [ListService, BoardService],
})
export class ListModule {}
