import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @Post()
  createCard(@Body() createCardDto: CreateCardDto, @UserInfo() user: User) { // 
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
  updateCard(@Param('cardId') id: number, @Body() updateCardDto: UpdateCardDto, @UserInfo() user: User) {
    return this.cardService.updateCard(id, updateCardDto, user.id);
  }

  @Delete(':cardId')
  removeCard(@Param('cardId') id: number, @UserInfo() user: User) {
    return this.cardService.removeCard(id, user.id);
  }

  @Post(':cardId/position/:value')
  changeCardPosition(@Param('cardId') cardId: number, @Param('value') value: number, @UserInfo() user: User) {
    return this.cardService.changeCardPosition(cardId, value, user.id);
  }

  @Get('resetPosition')
  test2() {
    return this.cardService.reset();
  }

  @Post('/:cardId/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File, @Param('cardId') cardId: number
  ) {
    return this.cardService.uploadFile(file, cardId);
  }

  @Post('/:cardId/removeFile')
  @UseInterceptors(FileInterceptor('file'))
  removeFile(@Param('cardId') cardId: number) {

    return this.cardService.removeFile(cardId);
  }
}
