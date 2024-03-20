import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from 'src/card/card.service';
import _ from 'lodash';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @Inject(CardService)
    private readonly cardService: CardService
  ) { }

  async createComment(createCommentDto: CreateCommentDto, userId: number) {
    const card = await this.cardService.findOneByCardId(createCommentDto.cardId);
    if (_.isNil(card))
      throw new NotFoundException('존재하지 않는 카드입니다.')

    // card.list.boardId
    // 댓글을 작성할 수 있는 권한이 있는지 체크


    return await this.commentRepository.save({
      content: createCommentDto.content,
      cardId: createCommentDto.cardId,
      userId: 1,
    });
  }

  async findAllCommentByCardId(cardId: number, userId: number) {
    // card.list.boardId
    // 댓글을 조회할 수 있는 권한이 있는지 체크

    return await this.commentRepository.findBy({cardId});
  }

  async findOneComment(id: number) {
    return await this.commentRepository.findOneBy({id});
  }

  async updateComment(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    await this.validate(id, userId);

    await this.commentRepository.update({id}, updateCommentDto)

    return {message: '수정 완료!'};
  }

  async removeComment(id: number, userId: number) {
    await this.validate(id, userId);

    await this.commentRepository.delete({id})

    return `This action removes a #${id} comment`;
  }

  async validate(id: number, userId: number) {
    const selectComment = await this.findOneComment(id);
    if(_.isNil(selectComment))
      throw new NotFoundException('존재하지 않는 댓글입니다.');

    if(selectComment.userId !== userId)
      throw new BadRequestException('댓글 수정 권한이 없습니다.');
  }
}
