import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, In, Repository } from 'typeorm';
import _ from 'lodash';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ListService } from 'src/list/list.service';
import { BoardService } from 'src/board/board.service';
import 'dayjs/locale/ko';

@Injectable()
export class CardService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @Inject(ListService)
    private readonly listService: ListService,
    @Inject(BoardService)
    private readonly boardService: BoardService,
  ) { }

  async createCard(createCardDto: CreateCardDto, userId: number) {
    const list = await this.listService.findOne(createCardDto.listId);
    if (_.isNil(list))
      throw new NotFoundException('존재하지 않는 리스트입니다.')

    await this.CheckAllowBoard(createCardDto.listId, userId);

    await this.CheckAllowBoard(createCardDto.listId, createCardDto.worker);

    if (!(/^\d{4}-\d{1,2}-\d{1,2}$/).test(createCardDto.startDate) ||
      !(/^\d{4}-\d{1,2}-\d{1,2}$/).test(createCardDto.dueDate))
      throw new BadRequestException('시작일 또는 마감일 요청이 올바르지 않습니다.')

    const startDate = new Date(createCardDto.startDate);
    const dueDate = new Date(createCardDto.dueDate);

    if (!startDate || !dueDate)
      throw new BadRequestException('시작일 또는 마감일 요청이 올바르지 않습니다.')

    console.log(startDate, dueDate, new Date());
    if (dueDate < new Date() || startDate > dueDate)
      throw new BadRequestException('마감일이 올바르지 않습니다.');

    let nextCardPosition: number;

    const cardList = await this.sortByPosition('card', list.id, 'ASC');
    if (cardList.length === 0)
      nextCardPosition = Number.MAX_VALUE / 2;
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

  // 카드 조회
  async findListId(listId: number): Promise<{}> {
    const cards = await this.cardRepository.find({ where: { listId }, order: {position: 'ASC'} });
    if (!cards.length) {
      throw new NotFoundException(`No cards found for list with ID ${listId}`);
    }
    return cards.map((card) => {
      return {
        cardId: card.id,
        listId: card.listId,
        userId: card.userId,
        타이틀: card.title,
        내용: card.content,
        이미지: card.image,
        배경색상: card.backgroundColor,
        작업자Id: card.worker,
        시작일: card.startDate,
        마감일: card.dueDate,
        position: card.position
      };
    });
  }

  async findOneByCardId(id: number) {
    const card = await this.cardRepository.findOneBy({id});
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
    return card;
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

  async changeCardPosition(cardId: number, changePositionNumber: number, userId: number) {
    const card = await this.findOneByCardId(cardId);
    await this.CheckAllowBoard(card.listId, userId);
    const selectCard = await this.sortByPosition('card', card.listId, 'ASC');
    const selectPosition = selectCard[changePositionNumber - 1].position;

    if (changePositionNumber > selectCard.length || changePositionNumber <= 0)
      throw new BadRequestException('요청한 position은 card의 범위를 넘어갔습니다.')

    // 첫 번째 자리로 옮기는 경우
    if (changePositionNumber === 1) {
      // position을 초기화 해야 하는 경우(더이상 나누어지지않고 같은 값이 되어버릴 때)
      if (selectPosition === selectPosition / 2) {
        const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
        await this.resetPosition(resetCard);
      }

      await this.cardRepository.update({ id: cardId }, { position: selectPosition / 2 });
      return { message: `${changePositionNumber}번 째 순서로 변경 완료!` }
    }

    // 마지막 자리로 옮기는 경우 기존 마지막녀석의 position을 그 앞으로 옮기게 값을 바꾸고
    // 이후에 우리가 선택한 녀석을 마지막자리로 보내준다(Number.MAX_VALUE/2가 마지막 수 고정)
    if (changePositionNumber === selectCard.length) {
      // position을 초기화해야 하는 경우(last position과 last-1 position의 합을 2로 나눈 값이 last-1 position일 경우)
      if (selectCard[selectCard.length - 2].position === (selectPosition + selectCard[selectCard.length - 2].position) / 2) {
        const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
        await this.resetPosition(resetCard);
      }
      await this.cardRepository.update({ id: selectCard[selectCard.length - 1].id }, { position: (selectPosition + selectCard[selectCard.length - 2].position) / 2 });
      await this.cardRepository.update({ id: cardId }, { position: Number.MAX_VALUE / 2 })
      return { message: `${changePositionNumber}번 째 순서로 변경 완료!` }
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

  async changeCardPositionToAnotherList(listId: number, cardId: number, changePositionNumber: number, userId: number) {
    if (!listId)
      return await this.changeCardPosition(cardId, changePositionNumber, userId);

    const card = await this.findOneByCardId(cardId);
    await this.CheckAllowBoard(card.listId, userId);
    const changeList = await this.listService.findOne(listId);
    
    if (changeList.boardId !== (await this.listService.findOne(listId)).boardId)
      throw new BadRequestException('요청하신 list는 같은 board가 아닙니다.');

    const cards = await this.cardRepository.findBy({listId});

    if(cards.length === 0) {
      await this.cardRepository.update({id: cardId}, {listId, position: Number.MAX_VALUE / 2});
      return {message: `${listId}번 리스트에 1번째 순서로 변경 완료!`};
    }

    if(changePositionNumber > cards.length)
    throw new BadRequestException('요청한 position은 card의 범위를 넘어갔습니다.');

    const selectPosition = cards[changePositionNumber - 1].position;

    // 첫 번째 자리로 옮기는 경우
    if (changePositionNumber === 1) {
      // position을 초기화 해야 하는 경우(더이상 나누어지지않고 같은 값이 되어버릴 때)
      if (selectPosition === selectPosition / 2) {
        const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
        await this.resetPosition(resetCard);
      }
      await this.cardRepository.update({ id: cardId }, { position: selectPosition / 2, listId });
      return { message: `${listId}번 리스트의 ${changePositionNumber}번 째 순서로 변경 완료!` }
    }

    // 마지막 자리로 옮기는 경우 기존 마지막녀석의 position을 그 앞으로 옮기게 값을 바꾸고
    // 이후에 우리가 선택한 녀석을 마지막자리로 보내준다(Number.MAX_VALUE/2가 마지막 수 고정)
    if (changePositionNumber === cards.length) {
      // position을 초기화해야 하는 경우(last position과 last-1 position의 합을 2로 나눈 값이 last-1 position일 경우)
      if (cards[cards.length - 2].position === (selectPosition + cards[cards.length - 2].position) / 2) {
        const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
        await this.resetPosition(resetCard);
      }
      await this.cardRepository.update({ id: cards[cards.length - 1].id }, { position: (selectPosition + cards[cards.length - 2].position) / 2 });
      await this.cardRepository.update({ id: cardId }, { position: Number.MAX_VALUE / 2 })
      return { message: `${listId}번 리스트의 ${changePositionNumber}번 째 순서로 변경 완료!` }
    }

    // 다른 리스트로 카드를 옮기는 경우는 무조건 그 앞의 카드와의 합을 2로 나눠준다.
    const nextPosition = cards[changePositionNumber-2].position;
    const changeValue = (selectPosition + nextPosition) / 2;

    // position을 초기화해야 하는 경우((A + B) / 2가 A가 될 경우)
    if (nextPosition === changeValue) {
      const resetCard = await this.sortByPosition('card', card.listId, 'DESC');
      await this.resetPosition(resetCard);
    }

    await this.cardRepository.update({ id: cardId }, { position: changeValue });

    return { message: `${listId}번 리스트의 ${changePositionNumber}번 째 순서로 변경 완료!` };

  }

  async uploadFile(file: Express.Multer.File, id: number) {
    await this.cardRepository.update({ id }, { image: file['location'] });

    return { imageUrl: file['location'] }
  }

  async removeFile(id: number, userId: number) {
    const card = await this.validate(id, userId);
    if (card.image === '')
      throw new BadRequestException('해당 카드의 image는 이미 존재하지 않습니다.');

    const index = card.image.search('.com/') + 5;
    const key = card.image.substring(index);
    const s3 = new S3({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    })

    await s3.deleteObject({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
    })
    await this.cardRepository.update({ id }, { image: null });

    return { message: "image 삭제 완료!" }
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
  async sortByPosition(value: string, id: number, orderValue: FindOptionsOrderValue) {
    if (value === 'card') {
      return await this.cardRepository.find({
        where: { listId: id },
        order: { position: orderValue }
      })
    }
  }

  // 순서 값 초기화 메서드
  async resetPosition(selectCard: Card[]) {
    let position = Number.MAX_VALUE
    for (let card of selectCard) {
      position /= 2;
      await this.cardRepository.update({ id: card.id }, { position: position });
    }
  }

  async reset(listId: number) {
    await this.resetPosition(await this.sortByPosition('card', listId, 'DESC'));
    return await this.sortByPosition('card', listId, 'ASC');
  }

  // validate Board 
  async CheckAllowBoard(listId: number, userId: number) {
    const list = await this.listService.findOne(listId);
    const checkAllow = await this.boardService.checkSharedBoard(list.boardId, userId)
    if (!checkAllow || checkAllow.status !== 'accepted')
      throw new UnauthorizedException('접근자 또는 작업자가 권한이 없습니다.');
  }
}
