import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserPlaidBankAccountResolver } from './userPlaidBankAccount.resolver';
import { UserPlaidBankAccountService } from './userPlaidBankAccount.service';
import { UserPlaidBankAccount } from './entities/userPlaidBankAccount.entity';
import { PlaidModule } from '../plaid/plaid.module';
import { AuthModule } from '../auth/auth.module';
import { UserPlaidItemModule } from '../user-plaid-item/userPlaidItem.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserPlaidBankAccount]),
    PlaidModule,
    AuthModule,
    UserPlaidItemModule,
  ],
  providers: [UserPlaidBankAccountService, UserPlaidBankAccountResolver],
  exports: [UserPlaidBankAccountService],
})
export class UserPlaidBankAccountModule {}
