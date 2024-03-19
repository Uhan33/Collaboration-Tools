import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @IsOptional()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;
}
