import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseArrayPipe,
} from '@nestjs/common';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post('create')
  async createBoard(@Body() createBoardDto: CreateBoardDto, userId: number) {
    return await this.boardService.createBoard(createBoardDto);
  }

  @Get(':userId')
  async getBoards(@Param('userId') userId: number) {
    return await this.boardService.getBoards(userId);
  }

  @Patch(':userId/:boardId')
  async updateBoard(
    @Param('userId') userId: number,
    @Param('id') id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return await this.boardService.updateBoard(userId, id, updateBoardDto);
  }

  @Delete(':userId/:boardId')
  async removeBoard(
    @Param('userId') userId: number,
    @Param('boardId') boardId: number,
  ) {
    return await this.boardService.removeBoard(userId, boardId);
  }

  @Post(':id/invite/:invitedUser')
  async inviteUser(
    @Param('id') id: number,
    @Param('invitedUser') invitedUser: number,
  ) {
    try {
      const shared = await this.boardService.inviteUser(id, invitedUser);
      if (shared === null) {
        return { message: '이미 공유가 된 사용자입니다.' };
      }
      return { message: '사용자가 초대되었습니다.' };
    } catch (err) {
      return { message: '초대 과정에서 오류 발생가 발생되었습니다.' };
    }
  }
}
