<<<<<<< HEAD
import { Card } from "src/card/entities/card.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

=======
import { Card } from 'src/card/entities/card.entity';
import { User } from 'src/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
>>>>>>> dev

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

<<<<<<< HEAD
    @CreateDateColumn()
    createdAt: Date;
=======
  @CreateDateColumn()
  createdAt: Date;
>>>>>>> dev

  @UpdateDateColumn()
  updatedAt: Date;

<<<<<<< HEAD
    @ManyToOne(() => Card, (card) => card.comment, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    card: Card;

    @ManyToOne(() => User, (user) => user.comment, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    user: User;
=======
  @ManyToOne(() => Card, (card) => card.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  card: Card;
<<<<<<< HEAD
>>>>>>> dev
=======

  @ManyToOne(() => User, (user) => user.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
>>>>>>> dev
}
