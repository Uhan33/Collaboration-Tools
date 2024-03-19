import { PartialType } from '@nestjs/mapped-types';
import { CreateListDto } from './create-list.dto';
import { IsString } from 'class-validator';

export class UpdateListDto extends PartialType(CreateListDto) {
  @IsString()
  title: string;
}
