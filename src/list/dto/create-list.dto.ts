import { PickType } from '@nestjs/swagger';
import { List } from '../entities/list.entity';
// import { IsNumber, IsString } from 'class-validator';

export class CreateListDto extends PickType(List, ['title']) {
  // /**
  //  * 리스트 제목
  //  * @example "리스트 제목입니다."
  //  */
  // @IsString()
  // title: string;
  // @IsNumber()
  // boardId: number;
  // @IsString()
  // position: string;
}
