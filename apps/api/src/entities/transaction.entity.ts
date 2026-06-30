import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { TransactionType } from '@cuentas/types';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: TransactionType;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  amount: number;

  @Column()
  category: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
