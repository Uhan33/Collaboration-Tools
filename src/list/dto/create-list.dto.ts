import { IsNumber, IsString } from 'class-validator';

export class CreateListDto {
  @IsString()
  title: string;

  @IsNumber()
  boardId: number;

  @IsString()
  position: number;
}
