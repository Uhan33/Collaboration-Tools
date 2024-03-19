import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, List, Shared])], // List, Shared는 삭제예정
  controllers: [CardController],
  providers: [CardService],
  exports:[CardService]
})
export class CardModule {}
