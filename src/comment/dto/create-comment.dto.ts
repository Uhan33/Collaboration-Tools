import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty({ message: '카드 ID를 입력해주세요.' })
    cardId: number;

    @IsString()
    @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
    content: string;
}
