import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, In, Repository } from 'typeorm';
import _ from 'lodash';
import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CardService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(List)
    private listRepository: Repository<List>, // list 메서드 생기면 삭제
    @InjectRepository(Shared)
    private sharedRepository: Repository<Shared>, // shared 메서드 생기면 삭제
  ) {}

  async createCard(createCardDto: CreateCardDto, userId: number) {
    const list = await this.findlistById(createCardDto.listId);
    if (_.isNil(list))
      throw new NotFoundException('존재하지 않는 리스트입니다.');

    await this.CheckAllowBoard(createCardDto.listId, userId);

    await this.CheckAllowBoard(createCardDto.listId, createCardDto.worker);

    if (
      !/^\d{4}-\d{1,2}-\d{1,2}$/.test(createCardDto.startDate) ||
      !/^\d{4}-\d{1,2}-\d{1,2}$/.test(createCardDto.dueDate)
    )
      throw new BadRequestException(
        '시작일 또는 마감일 요청이 올바르지 않습니다.',
      );

    const startDate = new Date(createCardDto.startDate);
    const dueDate = new Date(createCardDto.dueDate);

    if (!startDate || !dueDate)
      throw new BadRequestException(
        '시작일 또는 마감일 요청이 올바르지 않습니다.',
      );

    let nextCardPosition: number;

    const cardList = await this.sortByPosition('card', list.id, 'ASC');
    if (cardList.length === 0) nextCardPosition = Number.MAX_VALUE / 2;
    else {
      nextCardPosition = cardList[0].position / 2;
      // position 초기화작업
      if (nextCardPosition === cardList[0].position) {
        const resetCard = await this.sortByPosition('card', list.id, 'DESC');
        await this.resetPosition(resetCard);
      }
    }

    const newCard = await this.cardRepository.save({
      listId: createCardDto.listId,
      userId,
      title: createCardDto.title,
      content: createCardDto.content,
      worker: createCardDto.worker,
      backgroundColor: createCardDto.backgroundColor,
      position: nextCardPosition,
      startDate,
      dueDate,
    });

    return await this.cardRepository.findOneBy({ worker: newCard.worker });
  }

  async findAllCards(listId: number) {
    return `This action returns all card`;
  }

  async findOneByCardId(id: number) {
    if (_.isNil(await this.cardRepository.findOneBy({ id })))
      throw new NotFoundException('존재하지 않는 카드입니다.');

    return await this.cardRepository.findOneBy({ id });
  }

  async updateCard(id: number, updateCardDto: UpdateCardDto, userId: number) {
    const card = await this.findOneByCardId(id);
    await this.CheckAllowBoard(card.listId, userId);

    if (updateCardDto.worker)
      await this.CheckAllowBoard(card.listId, updateCardDto.worker);

    if (_.isNil(updateCardDto))
      throw new BadRequestException('수정 내용이 비었습니다.');

    await this.cardRepository.update({ id }, updateCardDto);

    return { message: '수정 완료!' };
  }

  async removeCard(id: number, userId: number) {
    const card = await this.findOneByCardId(id);
    await this.CheckAllowBoard(card.listId, userId);
    await this.cardRepository.delete({ id });
    return { message: '삭제 완료!' };
  }

  async changeCardPosition(
    cardId: number,
    changePositionNumber: number,
    userId: number,
  ) {
    const card = await this.findOneByCardId(cardId);
    await this.CheckAllowBoard(card.listId, userId);
    const selectCard = await this.sortByPosition('card', card.listId, 'ASC');
    const selectPosition = selectCard[changePositionNumber - 1].position;

    if (changePositionNumber > selectCard.length || changePositionNumber <= 0)
      throw new BadRequestException(
        '요청한 position은 card의 범위를 넘어갔습니다.',
      );

    // 첫 번째 자리로 옮기는 경우
    if (changePositionNumber === 1) {
      // position을 초기화 해야 하는 경우(더이상 나누어지지않고 같은 값이 되어버릴 때)
      if (selectPosition === selectPosition / 2) {
        const resetCard = await this.sortByPosition(
          'card',
          card.listId,
          'DESC',
        );
        await this.resetPosition(resetCard);
      }

      await this.cardRepository.update(
        { id: cardId },
        { position: selectPosition / 2 },
      );
      return { message: `${changePositionNumber}번 째 순서로 변경 완료!` };
    }

    // 마지막 자리로 옮기는 경우 기존 마지막녀석의 position을 그 앞으로 옮기게 값을 바꾸고
    // 이후에 우리가 선택한 녀석을 마지막자리로 보내준다(Number.MAX_VALUE/2가 마지막 수 고정)
    else if (changePositionNumber === selectCard.length) {
      // position을 초기화해야 하는 경우(last position과 last-1 position의 합을 2로 나눈 값이 last-1 position일 경우)
      if (
        selectCard[selectCard.length - 2].position ===
        (selectPosition + selectCard[selectCard.length - 2].position) / 2
      ) {
        const resetCard = await this.sortByPosition(
          'card',
          card.listId,
          'DESC',
        );
        await this.resetPosition(resetCard);
      }
      await this.cardRepository.update(
        { id: selectCard[selectCard.length - 1].id },
        {
          position:
            (selectPosition + selectCard[selectCard.length - 2].position) / 2,
        },
      );
      await this.cardRepository.update(
        { id: cardId },
        { position: Number.MAX_VALUE / 2 },
      );
      return { message: `${changePositionNumber}번 째 순서로 변경 완료!` };
    }

    // 앞 -> 뒤 : 선택한 위치의 다음 카드를 선택, 뒤 -> 앞 : 선택한 위치의 이전 카드를 선택
    let nextPosition = selectCard[changePositionNumber].position;
    if (card.position > selectPosition) {
      nextPosition = selectCard[changePositionNumber - 2].position;
    }

    const changeValue = (selectPosition + nextPosition) / 2;

    // position을 초기화해야 하는 경우((A + B) / 2가 A 혹은 B가 될 경우)
    if (nextPosition === changeValue || selectPosition === changeValue) {
      const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
      await this.resetPosition(resetCard);
    }

    await this.cardRepository.update({ id: cardId }, { position: changeValue });

    return { message: `${changePositionNumber}번 째 순서로 변경 완료!` };
  }

  async uploadFile(file: Express.Multer.File, id: number) {
    await this.cardRepository.update({ id }, { image: file['location'] });

    return { imageUrl: file['location'] };
  }

  async removeFile(id: number) {
    const card = await this.validate(id, 1);
    if (card.image === '')
      throw new BadRequestException(
        '해당 카드의 image는 이미 존재하지 않습니다.',
      );

    const index = card.image.search('.com/') + 5;
    const key = card.image.substring(index);
    const s3 = new S3({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });

    await s3.deleteObject({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    });
    await this.cardRepository.update({ id }, { image: null });

    return { message: 'image 삭제 완료!' };
  }

  async validate(id: number, userId: number) {
    const selectCard = await this.findOneByCardId(id);
    if (_.isNil(selectCard))
      throw new NotFoundException('존재하지 않는 카드입니다.');

    if (selectCard.userId !== userId)
      throw new BadRequestException('권한이 없습니다.');

    return selectCard;
  }

  // list를 정렬하려면 'list'와 boardId를 받고 card를 정렬하려면 'card'와 'listId' 받음
  async sortByPosition(
    value: string,
    id: number,
    orderValue: FindOptionsOrderValue,
  ) {
    if (value === 'card') {
      return await this.cardRepository.find({
        where: { listId: id },
        order: { position: orderValue },
      });
    }
  }

  // 순서 값 초기화 메서드
  async resetPosition(selectCard: Card[]) {
    let position = Number.MAX_VALUE;
    for (let card of selectCard) {
      position /= 2;
      await this.cardRepository.update({ id: card.id }, { position: position });
    }
  }

  async reset() {
    await this.resetPosition(await this.sortByPosition('card', 1, 'DESC'));
    return await this.sortByPosition('card', 1, 'ASC');
  }

  // -------------- list repo ----------------------
  async findlistById(id: number) {
    return await this.listRepository.findOneBy({ id });
  }

  // -------------- shared repo ---------------------
  async findUserByBoardId(boardId: number) {
    return await this.sharedRepository.findBy({ boardId });
  }

  async findboardByUserId(userId: number) {
    return await this.sharedRepository.findBy({ userId });
  }

  async findOneUser(userId: number, boardId: number) {
    return await this.sharedRepository.findOneBy({ userId, boardId });
  }

  // validate Board
  async CheckAllowBoard(listId: number, userId: number) {
    const checkBoard = await this.findlistById(listId);
    const checkShared = await this.findOneUser(userId, checkBoard.id);
    if (_.isNil(checkShared))
      throw new UnauthorizedException('접근자 또는 작업자가 권한이 없습니다.');
  }
}
