import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import {
  loadCacheModule,
  loadConfigModule,
  loadGraphqlModule,
  loadMikroOrmModule,
} from './shared/utils/loadModule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserPlaidBankAccountModule } from './user-plaid-bank-account/userPlaidBankAccount.module';
import { PlaidModule } from './plaid/plaid.module';
import { UserPlaidItemModule } from './user-plaid-item/userPlaidItem.module';
import { PlaidLinkTokenModule } from './plaid-link-token/plaidLinkToken.module';

@Module({
  imports: [
    loadMikroOrmModule(),
    loadConfigModule(),
    loadGraphqlModule(),
    loadCacheModule(),
    AuthModule,
    PlaidModule,
    EventEmitterModule.forRoot(),
    UserPlaidBankAccountModule,
    UserPlaidItemModule,
    PlaidLinkTokenModule,
  ],
})
export class AppModule {}
