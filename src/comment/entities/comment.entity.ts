import { Card } from 'src/card/entities/card.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'comment',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  cardId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Card, (card) => card.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  card: Card;
}
