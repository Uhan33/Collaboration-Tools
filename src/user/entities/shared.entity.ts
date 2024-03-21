import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Entity({
  name: 'shared',
})
export class Shared {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  boardId: number;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => User, (user) => user.shared)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Board, (board) => board.shared)
  @JoinColumn()
  board: Board;

  @OneToMany(() => Card, (card) => card.shared)
  card: Card[];
}
