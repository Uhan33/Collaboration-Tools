
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


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

  @ManyToOne(() => User, (user) => user.shared)
  @JoinColumn()
  user: User;
}
