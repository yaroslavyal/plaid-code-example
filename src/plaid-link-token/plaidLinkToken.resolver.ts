import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/policies.guard';
import { CaslAbilityFactory } from '../auth/casl-ability.factory';
import { GetPlaidLinkTokenArgs } from './dto/getPlaidLinkToken.args';
import { CurrentUser } from '../auth/decorator/currentUser';
import { Action, RequestUserInfo } from '../auth/types';
import { PlaidApi } from 'plaid';
import { ForbiddenError } from 'apollo-server-core';
import { PlaidLinkTokenService } from './plaidLinkToken.service';
import { UserPlaidItem } from '../user-plaid-item/entities/userPlaidItem.entity';

@UseGuards(PoliciesGuard)
@Resolver()
export class PlaidLinkTokenResolver {
  public constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly plaidLinkTokenService: PlaidLinkTokenService
  ) {}

  @Query(() => String, { name: 'getPlaidLinkToken' })
  async createPlaidLinkToken(
    @Args() args: GetPlaidLinkTokenArgs,
    @CurrentUser() requestUser: RequestUserInfo
  ): Promise<string> {
    const userId = requestUser.uuid;

    await this.caslAbilityFactory.canAccessOrFail({
      requestUser,
      userId,
      canParams: [
        { action: Action.ACCESS, subject: PlaidApi },
        { action: Action.READ, subject: UserPlaidItem },
      ],
      ForbiddenError,
    });

    return this.plaidLinkTokenService.createLinkToken(userId, args);
  }
}
