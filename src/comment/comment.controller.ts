import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @UserInfo() user: User,
  ) {
    return this.commentService.createComment(createCommentDto, user.id);
  }

  @Get()
  findAllCommentByCardId(
    @Query('cardId') cardId: number,
    @UserInfo() user: User,
  ) {
    return this.commentService.findAllCommentByCardId(cardId, user.id);
  }

  @Patch(':id')
  updateComment(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @UserInfo() user: User,
  ) {
    return this.commentService.updateComment(id, updateCommentDto, user.id);
  }

  @Delete(':id')
  removeComment(@Param('id') id: number, @UserInfo() user: User) {
    return this.commentService.removeComment(id, user.id);
  }
}
