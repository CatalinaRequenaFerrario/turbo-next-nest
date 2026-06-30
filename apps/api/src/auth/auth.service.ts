import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import type { AuthResponse } from '@cuentas/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto): Promise<AuthResponse> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({ email: dto.email, passwordHash });
    await this.users.save(user);

    return this.buildResponse(user);
  }

  async login(dto: AuthDto): Promise<AuthResponse> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponse {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}
