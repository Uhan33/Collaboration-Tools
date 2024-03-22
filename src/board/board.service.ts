import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Shared } from 'src/user/entities/shared.entity';
import _ from 'lodash';
import { MailService } from 'src/utils/mail/mail.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shared)
    private readonly sharedRepository: Repository<Shared>,
    private readonly mailService: MailService,
  ) {}

  // shared에도 생성한 사람 정보가 들어가야된다
  // where에 추가로 조건을 주던가
  async createBoard(
    // userId: number,
    user: User,
    createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    const users = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    if (!users) {
      throw new BadRequestException('유저를 찾을 수 없습니다.');
    }
    const newBoard = new Board();
    newBoard.title = createBoardDto.title;
    newBoard.content = createBoardDto.content;
    newBoard.backgroundColor = createBoardDto.backgroundColor;
    newBoard.user = users;
    return await this.boardRepository.save(newBoard);
  }

  // shared로 보드 권한 주기
  async getBoards(userId: number) {
    return await this.boardRepository.find({
      where: {
        userId,
      },
    });
  }

  // shared로 권한주기
  async updateBoard(
    user: User, // userInfo 에서 추출
    id: number,
    updateBoardDto: UpdateBoardDto,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (_.isNil(board)) {
      return null; // 보드가 존재하지 않음
    }

    // 보드의 소유자 혹은 공유된 보드 권한 확인하는 로직
    const owner = board.userId === +user.id;
    const shared = await this.checkSharedBoard(id, user.id); // userInfo -> user.id
    if (!owner && !shared) {
      return { message: '보드를 수정할 권한이 없습니다.' }; // 보드를 수정할 권한이 없음
    }

    // 보드 status를 확인 후 업데이트 가능 유무 반환
    const sharedStatus = await this.sharedRepository.findOne({
      where: {
        userId: user.id,
        boardId: id,
      },
    });

    if (!owner && (!sharedStatus || sharedStatus.status !== 'accepted')) {
      return {
        message:
          '초대를 승낙하지 않아 보드를 수정할 수 없습니다. 초대 승낙 후 이용해주세요.',
      };
    }

    board.title = updateBoardDto.title;
    board.backgroundColor = updateBoardDto.backgroundColor;
    board.content = updateBoardDto.content;

    await this.boardRepository.save(board);
    return board;
  }

  // 삭제는 생성한 사람만
  async removeBoard(user: User, id: number): Promise<boolean> {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board || board.userId !== +user.id) {
      return false;
    }

    await this.boardRepository.remove(board);
    return true;
  }

  async inviteUser(
    id: number,
    invitedUserEmail: string,
    currentUser: User,
  ): Promise<Shared | null> {
    const user = await this.userRepository.findOne({
      where: {
        email: invitedUserEmail,
      },
    });

    const board = await this.boardRepository.findOne({
      where: {
        id,
      },
    });

    if (board.userId !== +currentUser.id) {
      throw new Error('보드에 초대할 권한이 없습니다.');
    }

    if (!user) {
      throw new Error('초대된 사용자를 찾을 수 없습니다.');
    }

    // 보드에 공유된 사용자인지 확인하고 공유가 됐다면 그 사용자에게는 null을 반환해줌
    const sharedUser = await this.sharedRepository.findOne({
      where: {
        userId: user.id, // 초대된 사용자
        boardId: id,
      },
    });
    if (sharedUser) {
      return null;
    }

    // 공유되지 않은 경우에 new Shared()를 통해 사용자를 보드에 초대
    const shared = new Shared();
    shared.userId = user.id;
    shared.boardId = id;
    await this.sharedRepository.save(shared);

    const subject = `${invitedUserEmail}님 SpaceRello 보드에 초대되었습니다.`;
    const content = `
      <p>${invitedUserEmail}님 SpaceRello 보드에 초대되었습니다.</p>
      <p>초대 확인 버튼을 누르시면 초대를 승낙할 수 있습니다.</p>
      <form action="http://localhost:3000/board/invite/accept" method="POST">
        <input type="hidden" name="userId" value="${user.id}">
        <input type="hidden" name="boardId" value="${id}">
        <button type="submit">초대 확인</button>
      </form>
    `;

    await Promise.all([
      this.mailService.sendMail(invitedUserEmail, subject, content),
    ]);

    return shared;
  }

  // 초대 받은 사용자가 초대를 승낙하는 로직

  async acceptInvite(user: User) {
    const shared = await this.sharedRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!shared) {
      return { message: '초대 된 사용자가 아닙니다.' };
    }

    shared.status = 'accepted';
    await this.sharedRepository.save(shared);
    return shared;
  }

  // 초대 받은 사용자가 초대를 거부하는 로직
  async refuseInvite(user: User) {
    const shared = await this.sharedRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!shared) {
      return { message: '초대 된 사용자가 아닙니다.' };
    }

    shared.status = 'refuse';
    await this.sharedRepository.save(shared);
    return shared;
  }

  /// 공유가 된 사용자인지 확인
  async checkSharedBoard(boardId: number, userId: number): Promise<Shared> {
    const shared = await this.sharedRepository.findOne({
      where: {
        boardId,
        userId,
      },
    });
    return shared;
  }

  // list에서 boardId 확인용
  async findById(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board) {
      throw new NotFoundException('해당 board가 존재하지 않습니다.');
    }
    return board;
  }
}
