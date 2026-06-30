import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { Summary } from '@cuentas/types';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,
  ) {}

  findAll(userId: string): Promise<Transaction[]> {
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async getSummary(userId: string): Promise<Summary> {
    const transactions = await this.findAll(userId);

    let income = 0;
    let expense = 0;
    const byCategoryMap = new Map<string, { amount: number; type: string }>();

    for (const t of transactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;

      const existing = byCategoryMap.get(t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        byCategoryMap.set(t.category, { amount: t.amount, type: t.type });
      }
    }

    return {
      income,
      expense,
      balance: income - expense,
      byCategory: Array.from(byCategoryMap.entries()).map(([category, v]) => ({
        category,
        amount: v.amount,
        type: v.type as 'income' | 'expense',
      })),
    };
  }

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const t = this.repo.create({ ...dto, userId, note: dto.note ?? null });
    return this.repo.save(t);
  }

  async remove(userId: string, id: string): Promise<void> {
    const t = await this.repo.findOne({ where: { id, userId } });
    if (!t) throw new NotFoundException('Movimiento no encontrado');
    await this.repo.remove(t);
  }
}
