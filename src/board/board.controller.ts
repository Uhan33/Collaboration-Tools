import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseArrayPipe,
  UseGuards,
} from '@nestjs/common';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardService } from './board.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createBoard(
    @UserInfo() user: User,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return await this.boardService.createBoard(user, createBoardDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getBoards(@Param('userId') userId: number) {
    return await this.boardService.getBoards(userId);
  }

  @Patch(':boardId')
  @UseGuards(AuthGuard('jwt'))
  async updateBoard(
    @UserInfo() user: User,
    @Param('id') id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return await this.boardService.updateBoard(user, id, updateBoardDto);
  }

  @Delete(':boardId')
  @UseGuards(AuthGuard('jwt'))
  async removeBoard(@UserInfo() user: User, @Param('boardId') boardId: number) {
    return await this.boardService.removeBoard(user, boardId);
  }

  @Post(':id/invite/:invitedUser')
  @UseGuards(AuthGuard('jwt'))
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

  @Patch('invite/accept')
  @UseGuards(AuthGuard('jwt'))
  async acceptInvite(@UserInfo() user: User) {
    return await this.boardService.acceptInvite(user);
  }

  @Patch('invite/refuse')
  @UseGuards(AuthGuard('jwt'))
  async refuseInvite(@UserInfo() user: User) {
    return await this.boardService.refuseInvite(user);
  }
}
