import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCardDto {
    @IsNumber()
    @IsNotEmpty({ message: '리스트 아이디를 입력해주세요.' })
    listId: number;

    @IsString()
    @IsNotEmpty({ message: '카드 타이틀을 입력해주세요.' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: '카드 내용을 입력해주세요.' })
    content: string;

    worker: number;

    backgroundColor: string;

    @IsString()
    @IsNotEmpty({ message: '시작일을 입력해주세요 ex) 2024-03-18' })
    startDate: string;

    @IsString()
    @IsNotEmpty({ message: '마감일을 입력해주세요 ex) 2024-03-18' })
    dueDate: string;

}

