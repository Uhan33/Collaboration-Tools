import { List } from 'src/list/entities/list.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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


    @Column({ type: 'varchar', nullable: false, default: 'white'})
    backgroundColor: string

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
}

  @ManyToOne(() => User, (user) => user.board)
  @JoinColumn()
  user: User;

  @OneToMany(() => List, (list) => list.board, {
    cascade: true,
  })
  list: List[];
}
