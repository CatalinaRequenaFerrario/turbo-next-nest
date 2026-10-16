import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ParseTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;
}
