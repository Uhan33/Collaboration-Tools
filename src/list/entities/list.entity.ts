import { Board } from "src/board/entities/board.entity";
import { Card } from "src/card/entities/card.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'list',
})
export class List {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    boardId: number

    @Column({ type: 'varchar', nullable: false})
    title: string

    @Column({ type: 'varchar', nullable: false})
    position: string

    @CreateDateColumn() 
    createdAt: Date; 

    @UpdateDateColumn() 
    updatedAt: Date;

    @ManyToOne(() => Board, (board) => board.list, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    board: Board;

    @OneToMany(() => Card, (card) => card.list, {
        cascade: true,
    })
    card: Card;
}


