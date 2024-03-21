// import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateListDto } from './dto/create-list.dto';
// import { List } from './entities/list.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// @Injectable()
// export class ListService {
//   constructor(
//     @InjectRepository(List)
//     private readonly listRepository: Repository<List>,
//   ) {}

//   //리스트 조회
//   async findAll(boardId: number) {
//     const lists = await this.listRepository.find({
//       where: { boardId },
//     });
//     return lists;
//   }

//   //리스트 생성
//   // async create(boardId: number, { title, position }: CreateListDto) {
//   //   await this.listRepository.save({ boardId, position, title });
//   //   return { boardId, position, title };
//   // }

//   //리스트 수정
//   async update(boardId: number, id: number, { title }: CreateListDto) {
//     if (!title) {
//       throw new BadRequestException('리스트명을 작성해주세요.');
//     }
//     const updateList = await this.listRepository.update(
//       { boardId, id },
//       { title },
//     );
//     return updateList;
//   }
//   //리스트 삭제
//   async delete(id: number) {
//     return await this.listRepository.delete({ id });
//   }

//   // //리스트 이동
//   // async moveList(id: number, value: number) {
//   //   // const
//   // }
// }
