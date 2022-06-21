import { FilterQuery, FindOptions, QueryOrder } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserInputError } from 'apollo-server-core';
import { BaseService } from '../shared/base.service';
import {
  GOOD_FOR_ACH_FUNDING_FILTER,
  UserPlaidBankAccount,
} from './entities/userPlaidBankAccount.entity';
import { NotFoundError } from '../shared/errors';
import { UserPlaidIdentifierInput } from './dto/userPlaidIdentifier.input';
import { GetUserPlaidLinkedItemsArgs } from './dto/getUserPlaidLinkedItems.args';
import { ObjectQuery } from '@mikro-orm/core/typings';

@Injectable()
export class UserPlaidBankAccountService extends BaseService<UserPlaidBankAccount> {
  protected logger: Logger;
  public constructor(
    @InjectRepository(UserPlaidBankAccount)
    private readonly userPlaidBankAccountRepo: EntityRepository<UserPlaidBankAccount>
  ) {
    super(userPlaidBankAccountRepo);
    this.logger = new Logger(UserPlaidBankAccountService.name);
  }

  public async getUserPlaidBankAccountList(
    userId: string,
    args: GetUserPlaidLinkedItemsArgs
  ): Promise<UserPlaidBankAccount[]> {
    if (!userId) {
      throw new NotFoundError('User not found');
    }

    let filterQuery: FilterQuery<UserPlaidBankAccount> = { userId };
    const findOptions: FindOptions<UserPlaidBankAccount> = {
      filters: {},
      orderBy: { createdAt: QueryOrder.ASC },
    };

    const { plaidBankAccountList, forACHFunding } = args;
    if (plaidBankAccountList && plaidBankAccountList.length > 0) {
      filterQuery = this.buildQueryFromIdentifierInput(
        filterQuery,
        plaidBankAccountList
      );
    }

    if (typeof forACHFunding === 'boolean') {
      findOptions.filters[GOOD_FOR_ACH_FUNDING_FILTER] = {
        goodSide: forACHFunding,
      };
    }

    const bankAccounts: UserPlaidBankAccount[] = await this.findActiveList(
      filterQuery,
      findOptions
    );

    return bankAccounts;
  }

  private buildQueryFromIdentifierInput(
    filterQuery: ObjectQuery<UserPlaidBankAccount>,
    plaidInputList: Partial<UserPlaidIdentifierInput>[]
  ) {
    const orFilters: Partial<UserPlaidBankAccount>[] = plaidInputList.map(
      (input) => {
        const { id, userPlaidBankAccountId } = input;
        const query: Partial<UserPlaidBankAccount> = {};
        if (!id && !userPlaidBankAccountId) {
          throw new UserInputError('Plaid linked item is missing identifier');
        }

        if (id) {
          query.id = id;
        }
        if (userPlaidBankAccountId) {
          query.accountId = userPlaidBankAccountId;
        }

        return query;
      }
    );
    filterQuery.$and = [{ $or: orFilters }];

    return filterQuery;
  }
}
