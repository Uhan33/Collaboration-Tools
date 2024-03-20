import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  createCard(@Body() createCardDto: CreateCardDto ,@Body() userId: number) {
    return this.cardService.createCard(createCardDto, userId);
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
