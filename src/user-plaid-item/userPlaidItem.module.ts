import { Module } from '@nestjs/common';
import { UserPlaidItemService } from './userPlaidItem.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserPlaidItem } from './entities/userPlaidItem.entity';
import { PlaidModule } from '../plaid/plaid.module';

@Module({
  imports: [MikroOrmModule.forFeature([UserPlaidItem]), PlaidModule],
  providers: [UserPlaidItemService],
  exports: [UserPlaidItemService],
})
export class UserPlaidItemModule {}
