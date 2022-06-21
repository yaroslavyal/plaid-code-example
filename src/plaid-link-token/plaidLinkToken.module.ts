import { Module } from '@nestjs/common';
import { PlaidLinkTokenService } from './plaidLinkToken.service';
import { PlaidLinkTokenResolver } from './plaidLinkToken.resolver';
import { AuthModule } from '../auth/auth.module';
import { UserPlaidItemModule } from '../user-plaid-item/userPlaidItem.module';
import { PlaidModule } from '../plaid/plaid.module';

@Module({
  imports: [AuthModule, UserPlaidItemModule, PlaidModule],
  providers: [PlaidLinkTokenService, PlaidLinkTokenResolver],
})
export class PlaidLinkTokenModule {}
