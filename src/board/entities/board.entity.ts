import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'board',
})
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: false, default: 'white' })
  backgroundColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.board)
  @JoinColumn()
  user: User;

  @OneToMany(() => List, (list) => list.board, {
    cascade: true,
  })
  list: List[];

  @OneToMany(() => Shared, (shared) => shared.board, {
    cascade: true,
  })
  shared: Shared[];
}
