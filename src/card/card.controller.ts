import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  createCard(@Body() createCardDto: CreateCardDto, @UserInfo() user: User) {
    return this.cardService.createCard(createCardDto, user.id);
  }

  @Get()
  findAllCards(@Query('listId') listId: number) {
    return this.cardService.findAllCards(listId);
  }

  @Get(':cardId')
  findOneByCardId(@Param('cardId') cardId: number) {
    return this.cardService.findOneByCardId(cardId);
  }

  @Patch(':cardId')
  updateCard(@Param('cardId') id: number, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.updateCard(id, updateCardDto);
  }

  @Delete(':cardId')
  removeCard(@Param('cardId') id: number) {
    return this.cardService.removeCard(id);
  }

  @Post(':cardId/position/:value')
  changeCardPosition(@Param('cardId') cardId: number, @Param('value') value: number) {
    return this.cardService.changeCardPosition(cardId, value);
  }

  @Get('test/:id')
  testOrderByPosition(@Param('id') id: number) {
    return this.cardService.sortByPosition('card', id);
  }
}
