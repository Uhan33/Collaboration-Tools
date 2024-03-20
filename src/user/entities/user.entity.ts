import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../types/userRole.type';
import { Shared } from './shared.entity';
import { Board } from 'src/board/entities/board.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => Shared, (shared) => shared.user, {
    cascade: true
  })
  shared: Shared[];

  @OneToMany(() => Board, (board) => board.user, {
    cascade: true
  })
  board: Board[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true
  })
  comment: Comment[];
  

}
