import { Logger, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-core';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { CurrentUser } from '../auth/decorator/currentUser';
import { PoliciesGuard } from '../auth/policies.guard';
import { Action, RequestUserInfo } from '../auth/types';
import { UserPlaidBankAccountService } from './userPlaidBankAccount.service';
import { UserPlaidBankAccount } from './entities/userPlaidBankAccount.entity';
import { GetUserPlaidLinkedItemsArgs } from './dto/getUserPlaidLinkedItems.args';

@UseGuards(PoliciesGuard)
@Resolver()
export class UserPlaidBankAccountResolver {
  private readonly logger: Logger;
  public constructor(
    private readonly userPlaidBankAccountService: UserPlaidBankAccountService,
    private readonly caslAbilityFactory: CaslAbilityFactory
  ) {
    this.logger = new Logger(UserPlaidBankAccountResolver.name);
  }

  @Query(() => [UserPlaidBankAccount], { name: 'getUserPlaidBankAccounts' })
  async getUserPlaidBankAccounts(
    @Args() args: GetUserPlaidLinkedItemsArgs,
    @CurrentUser() requestUser: RequestUserInfo
  ) {
    const userId = requestUser.uuid;
    await this.caslAbilityFactory.canAccessOrFail({
      requestUser,
      userId,
      action: Action.READ,
      subject: UserPlaidBankAccount,
      ForbiddenError,
    });

    return this.userPlaidBankAccountService.getUserPlaidBankAccountList(
      userId,
      args
    );
  }
}
