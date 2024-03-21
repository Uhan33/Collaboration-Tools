import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드 제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '보드 배경색을 입력해주세요.' })
  backgroundColor: string;

  @IsString()
  content: string;
}
