import { UserInfo } from 'src/user/utils/userInfo.decorator';

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('1.Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 회원가입
  @ApiBody({
    description: '회원가입인가?',
    // type: RegisterDto,
  })
  @ApiOperation({
    summary: '회원가입',
    description: '사용자 정보를 추가합니다.',
  })
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    return await this.userService.register(
      RegisterDto.email,
      RegisterDto.password,
      RegisterDto.confirmPassword,
      RegisterDto.name,
    );
  }

  // 로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto.email, loginDto.password);
  }

  // 회원상세조회
  @UseGuards(AuthGuard('jwt'))
  @Get('email')
  getEmail(@UserInfo() user: User) {
    return { email: user.email, name: user.name };
  }

  // 회원전체조회
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  // 회원수정
  @UseGuards(AuthGuard('jwt')) // 인증된 사용자만 접근 가능
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  // 회원삭제
  @UseGuards(AuthGuard('jwt')) // 인증된 사용자만 접근 가능
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
