import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { Summary } from '@cuentas/types';
import { summarize } from './summary';

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
    return summarize(await this.findAll(userId));
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
