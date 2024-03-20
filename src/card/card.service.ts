import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(List)
    private listRepository: Repository<List>,  // list 메서드 생기면 삭제
    @InjectRepository(Shared)
    private sharedRepository: Repository<Shared>, // shared 메서드 생기면 삭제
  ) { }

  async createCard(createCardDto: CreateCardDto, userId: number) {
    const list = await this.findlistById(createCardDto.listId);
    if (_.isNil(list))
      throw new NotFoundException('존재하지 않는 리스트입니다.')

    // board 작업과 머지하면 만들예정
    // if(_.isNil(this.findOneUser(userId, list.boardId))) // list 메서드 생기면 삭제
    //   throw new BadRequestException('해당 List에 대한 Card 생성 권한이 없습니다.');

    const startDate = new Date(createCardDto.startDate);
    const dueDate = new Date(createCardDto.dueDate);

    if (!startDate || !dueDate)
      throw new BadRequestException('시작일 또는 마감일 요청이 올바르지 않습니다.');

    let nextCardPosition: number;

    const cardList = await this.sortByPosition('card', list.id);
    console.log(cardList);
    if (cardList.length === 0)
      nextCardPosition = Number.MAX_VALUE / 2;
    else
      nextCardPosition = cardList[0].position / 2;

    console.log(nextCardPosition);

    // if(nextCardPosition = cardlength)
    // position 초기화작업

    return await this.cardRepository.save({
      listId: createCardDto.listId,
      userId: 1,
      title: createCardDto.title,
      content: createCardDto.content,
      backgroundColor: createCardDto.backgroundColor,
      image: createCardDto.image,
      position: nextCardPosition,
      startDate,
      dueDate,
    });
  }

  async findAllCards(listId: number) {


    return `This action returns all card`;
  }

  async findOneByCardId(id: number) {
    if(_.isNil(await this.cardRepository.findOneBy({id})))
      throw new NotFoundException('존재하지 않는 카드입니다.')
    
    return await this.cardRepository.findOneBy({ id });
  }

  async updateCard(id: number, updateCardDto: UpdateCardDto) {
    if (_.isNil(await this.findOneByCardId(id)))
      throw new NotFoundException('존재하지 않는 카드입니다.');

    if (_.isNil(updateCardDto))
      throw new BadRequestException('수정 내용이 비었습니다.');

    await this.cardRepository.update({ id }, updateCardDto);

    return { message: '수정 완료!' };
  }

  async removeCard(id: number) {
    return `This action removes a #${id} card`;
  }

  async changeCardPosition(cardId: number, changePositionNumber: number) {
    const card = await this.findOneByCardId(cardId);

    const selectCard = await this.cardRepository.find({
      where: { listId: card.listId },
      order: { position: 'ASC' },
    });
    const selectPosition = selectCard[changePositionNumber - 1].position;

    // 첫 번째 자리로 옮기는 경우
    if (changePositionNumber === 1) {
      await this.cardRepository.update({ id: cardId }, { position: selectPosition / 2 });
      return { message: `${selectPosition / 2}로 이동` }
    }
    // 마지막 자리로 옮기는 경우 기존 마지막녀석의 position을 그 앞으로 옮기게 값을 바꾸고
    // 이후에 우리가 선택한 녀석을 마지막자리로 보내준다(Number.MAX_VALUE/2가 마지막 수 고정)
    else if (changePositionNumber === selectCard.length) {
      await this.cardRepository.update({ id: selectCard[selectCard.length-1].id }, { position: (selectPosition + selectCard[selectCard.length - 2].position) / 2 });
      await this.cardRepository.update({id: cardId}, {position: Number.MAX_VALUE/2})
      return { message: `${(selectPosition + selectCard[selectCard.length - 1].position) / 2}로 이동` }
    }

    const nextPosition = selectCard[changePositionNumber].position;
    const changeValue = (selectPosition + nextPosition) / 2;

    if (changePositionNumber >= selectCard.length || changePositionNumber <= 0)
      throw new BadRequestException('요청한 position은 card의 범위를 넘어갔습니다.')

    await this.cardRepository.update({id: cardId}, {position: changeValue});

    return { message: '순서 변경 완료!' };
  }

  // -------------- list repo ----------------------
  async findlistById(id: number) {
    return await this.listRepository.findOneBy({ id });
  }

  // list를 정렬하려면 'list'와 boardId를 받고 card를 정렬하려면 'card'와 'listId' 받음
  async sortByPosition(value: string, id: number) {
    if (value === 'card') {
      return await this.cardRepository.find({
        where: { listId: id },
        order: { position: 'ASC' }
      })
    }
  }

  async cardCount(id: number) {
    return await this.listRepository.countBy({ id });
  }


  // -------------- shared repo ---------------------
  async findUserByBoardId(boardId: number) {
    return await this.sharedRepository.findBy({ boardId })
  }

  async findboardByUserId(userId: number) {
    return await this.sharedRepository.findBy({ userId })
  }

  async findOneUser(userId: number, boardId: number) {
    return await this.sharedRepository.findOneBy({ userId, boardId });
  }
}
