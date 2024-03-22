import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { BoardService } from 'src/board/board.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('3.Lists')
@Controller(':boardId/list')
export class ListController {
  constructor(
    private readonly listService: ListService,
    private readonly boardService: BoardService,
  ) {}

  // 컬럼 리스트 조회
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Param('boardId') boardId: number) {
    await this.boardService.findById(boardId);

    const lists = await this.listService.findAll(boardId);

    return {
      statusCode: HttpStatus.OK,
      message: '리스트가 성공적으로 조회되었습니다.',
      lists,
    };
  }

  // 컬럼 리스트 생성
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(
    @Param('boardId') boardId: number,
    @Body() createListDto: CreateListDto,
  ) {
    await this.boardService.findById(boardId);
    const listNumber = await this.listService.count(boardId);
    return await this.listService.create(
      boardId,
      createListDto,
      Number(listNumber.totalList) + 1,
    );
  }

  // 컬럼 리스트 수정
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':listId')
  async update(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Body() createListDto: CreateListDto,
  ) {
    await this.boardService.findById(boardId);
    await this.listService.update(boardId, listId, createListDto);

    return {
      statusCode: HttpStatus.OK,
      message: '리스트가 성공적으로 수정되었습니다.',
      // list,
    };
  }

  // 컬럼 리스트 삭제
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':listId')
  async remove(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
  ) {
    await this.boardService.findById(boardId);
    await this.listService.delete(listId);
    return {
      statusCode: HttpStatus.OK,
      message: '리스트가 성공적으로 삭제되었습니다.',
    };
  }
  // 특정 컬럼 리스트 조회

  // 컬럼 리스트 이동
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':listId/position/:value')
  async moveList(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('value') value: number,
  ) {
    await this.boardService.findById(boardId);
    const list = await this.listService.moveList(listId, value);
    return {
      statusCode: HttpStatus.OK,
      message: '리스트가 성공적으로 이동되었습니다.',
      list,
    };
  }
}
