import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { AiService } from './ai.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../entities/user.entity';

interface AuthRequest extends Request {
  user: User;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private txService: TransactionsService,
    private aiService: AiService,
  ) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.txService.findAll(req.user.id);
  }

  @Get('summary')
  getSummary(@Request() req: AuthRequest) {
    return this.txService.getSummary(req.user.id);
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateTransactionDto) {
    return this.txService.create(req.user.id, dto);
  }

  @Post('parse')
  parse(@Body('text') text: string) {
    return this.aiService.parse(text);
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.txService.remove(req.user.id, id);
  }
}
