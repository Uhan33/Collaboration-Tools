import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Shared } from 'src/user/entities/shared.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shared)
    private readonly sharedRepository: Repository<Shared>,
  ) {}

  // shared에도 생성한 사람 정보가 들어가야된다
  // where에 추가로 조건을 주던가
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const user = await this.userRepository.findOne({
      where: {
        id: 1,
      },
    });

    if (!user) {
      throw new BadRequestException('유저를 찾을 수 없습니다.');
    }
    const newBoard = new Board();
    newBoard.title = createBoardDto.title;
    newBoard.content = createBoardDto.content;
    newBoard.backgroundColor = createBoardDto.backgroundColor;
    newBoard.userId = 1;
    return await this.boardRepository.save(newBoard);
  }

  // shared로 보드 권한 주기
  async getBoards(userId: number) {
    console.log('asfafasdfasfd', userId);
    return await this.boardRepository.find({
      where: {
        userId,
      },
    });
  }

  // shared로 권한주기
  async updateBoard(
    userId: number,
    id: number,
    updateBoardDto: UpdateBoardDto,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board || board.userId !== userId) {
      return null;
    }
    Object.assign(board, updateBoardDto);
    const updatedBoard = await this.boardRepository.update({ id }, board);
    return updatedBoard;
  }

  // 삭제는 생성한 사람만
  async removeBoard(userId: number, id: number): Promise<boolean> {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    console.log(board, typeof board.userId, typeof userId);
    if (!board || board.userId !== +userId) {
      return false;
    }
    await this.boardRepository.remove(board);
    return true;
  }

  async inviteUser(id: number, invitedUser: number): Promise<Shared | null> {
    // 보드에 공유된 사용자인지 확인하고 공유가 됐다면 그 사용자에게는 null을 반환해줌
    const sharedUser = await this.sharedRepository.findOne({
      where: {
        userId: invitedUser, // 초대된 사용자
        boardId: id,
      },
    });
    if (sharedUser) {
      return null;
    }

    // 공유되지 않은 경우에 new Shared()를 통해 사용자를 보드에 초대
    const shared = new Shared();
    shared.userId = invitedUser;
    shared.boardId = id;
    return await this.sharedRepository.save(shared);
  }

  async findOneByBoard(title: string) {
    return await this.boardRepository.findOneBy({ title });
  }

  async findOneById(id: number) {
    return await this.boardRepository.findOne({
      where: { id },
    });
  }
}
