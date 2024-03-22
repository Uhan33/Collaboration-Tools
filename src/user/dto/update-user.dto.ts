import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @IsOptional()
  @IsString({ message: '유효한 이름을 입력해주세요.' })
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsOptional()
  @IsString({ message: '유효한 비밀번호를 입력해주세요.' })
  changePassword: string;
}
