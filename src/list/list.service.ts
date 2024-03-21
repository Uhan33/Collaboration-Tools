import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { List } from './entities/list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  //컬럼 리스트 조회
  async findAll(boardId: number) {
    const lists = await this.listRepository.find({
      where: { boardId },
    });

    return lists;
  }

  //특정 컬럼 리스트 조회
  async findOne(id: number) {
    const list = await this.listRepository.find({ where: { id } });
    if (list.length === 0) {
      throw new NotFoundException('리스트가 존재하지 않습니다.');
    }
    return list[0];
  }

  //특정 보드 내 컬럼 리스트 수 카운팅
  async count(boardId: number) {
    const listCount = await this.listRepository
      .createQueryBuilder('list')
      .where({
        boardId: boardId,
      })
      .select('COUNT(list.position)', 'totalList')
      .getRawOne();

    return listCount;
  }

  //컬럼 리스트 생성
  async create(boardId: number, createListDto: CreateListDto, position) {
    const { title } = createListDto;
    await this.listRepository.save({ boardId, position, title });
    return { boardId, position, title };
  }

  //컬럼 리스트 수정
  async update(boardId: number, id: number, { title }: CreateListDto) {
    if (!title) {
      throw new BadRequestException('리스트명을 작성해주세요.');
    }
    const updateList = await this.listRepository.update(
      { boardId, id },
      { title },
    );
    return updateList;
  }
  //컬럼 리스트 삭제
  async delete(id: number) {
    const list = await this.listRepository.findOne({ where: { id } });
    const count = await this.count(list.boardId);
    await this.moveList(id, Number(count.totalList));
    await this.listRepository.delete(id);
  }

  //컬럼 리스트 이동
  async moveList(id: number, value: number) {
    //선택된 리스트
    const listOne = await this.findOne(id);
    //선택된 리스트와 이동할 위치설정
    let start = 0;
    let end = 0;
    if (listOne.position < value) {
      start = listOne.position;
      end = value;
    } else {
      start = value;
      end = listOne.position;
    }
    //컬럼 리스트 위치 값 사이의 컬럼 리스트 조회
    const betweenList = await this.listRepository.find({
      where: { position: Between(start, end) },
    });
    const moveBetweenList = listOne.position < value ? -1 : 1;
    for (const list of betweenList) {
      list.position += moveBetweenList;
    }
    await this.listRepository.save(betweenList);
    listOne.position = value;
    await this.listRepository.save(listOne);
    return listOne;
  }
}
