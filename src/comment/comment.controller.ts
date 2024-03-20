import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(@Body() createCommentDto: CreateCommentDto, userId: number) {
    return this.commentService.createComment(createCommentDto, userId);
  }

  @Get()
  findAllCommentByCardId(@Query('cardId') cardId: number, userId: number) {
    return this.commentService.findAllCommentByCardId(cardId, userId);
  }

  @Patch(':id')
  updateComment(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto, userId: number) {
    return this.commentService.updateComment(id, updateCommentDto, userId);
  }

  @Delete(':id')
  removeComment(@Param('id') id: number, userId: number) {
    return this.commentService.removeComment(id, userId);
  }
}
