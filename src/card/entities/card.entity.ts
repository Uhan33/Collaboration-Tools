import { Comment } from 'src/comment/entities/comment.entity';
import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'card',
})
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  listId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false, default: 'white' })
  backgroundColor: string;

  @Column({ type: 'int', nullable: false })
  position: number;

  @Column()
  startDate: Date;

  @Column()
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.card, {
    cascade: true,
  })
  comment: Comment[];

  @ManyToOne(() => List, (list) => list.card, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  list: List;
}
