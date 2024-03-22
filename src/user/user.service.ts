import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  async register(
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
  ) {
    // 이메일로 이미 가입된 사용자가 있는지 확인
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
      );
    }

    // 비밀번호와 비밀번호 확인이 일치하는지 확인
    if (password !== confirmPassword) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 10);

    // 사용자 정보 저장
    await this.userRepository.save({
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      name,
    });
  }
  // 로그인
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const payload = { email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 회원체크
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // 전체회원조회
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 회원정보 수정
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (!await compare(updateUserDto.password, user.password)) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    await this.userRepository.update({id}, {
      email: updateUserDto.email, 
      name: updateUserDto.name,
    });

    if(updateUserDto.changePassword)
      await this.userRepository.update({id}, {password: await hash(updateUserDto.changePassword, 10)});

    return await this.userRepository.findOneBy({id});
  }

  // 회원정보 삭제
  async deleteUser(id: number): Promise<{}> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.userRepository.delete({id});

    return {message: '삭제 완료!'};
  }
}
