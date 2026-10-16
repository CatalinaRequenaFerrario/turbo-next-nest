import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { User } from './entities/user.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
          if (!env[key]) throw new Error(`Falta la variable de entorno ${key}`);
        }
        return env;
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Transaction],
        synchronize: true,
      }),
    }),
    AuthModule,
    TransactionsModule,
  ],
})
export class AppModule {}
