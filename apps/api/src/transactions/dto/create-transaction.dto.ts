import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CATEGORIES } from '@cuentas/types';
import type { TransactionType } from '@cuentas/types';

export class CreateTransactionDto {
  @IsIn(['income', 'expense'])
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsIn([...CATEGORIES])
  category: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsDateString()
  date: string;
}
