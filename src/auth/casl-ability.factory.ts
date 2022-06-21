import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  createAliasResolver,
  ExtractSubjectType,
} from '@casl/ability';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PlaidApi } from 'plaid';
import {
  Action,
  AppAbility,
  PolicyHandler,
  RequestUserInfo,
  Roles,
  Subjects,
} from './types';
import { UserPlaidBankAccount } from '../user-plaid-bank-account/entities/userPlaidBankAccount.entity';
import { UserPlaidItem } from '../user-plaid-item/entities/userPlaidItem.entity';

const resolveAction = createAliasResolver({
  [Action.MODIFY]: [Action.UPDATE, Action.DELETE],
  [Action.ACCESS]: [Action.READ, Action.MODIFY],
}) as (action: Action | Action[]) => Action | Action[];

export interface CheckPolicyAccessProps {
  requestUser: RequestUserInfo;
  userId: string;
  action?: Action;
  subject?: Subjects;
  canParams?: {
    action: Action;
    subject: Subjects;
    field?: string;
  }[];
}
@Injectable()
export class CaslAbilityFactory {
  async createForRequestUser({
    requestUser,
    isMatchedUser,
  }: {
    requestUser: RequestUserInfo;
    isMatchedUser?: boolean;
  }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    );

    const isAdmin = requestUser?.roles.some((role) => role === Roles.Admin);

    if (isAdmin) {
      // for admin user
      can(Action.MANAGE, 'all');
    } else if (isMatchedUser !== false) {
      // for non-admin and non-not-matched user
      cannot(Action.DELETE, 'all');
      can(Action.READ, 'all');
      if (isMatchedUser === true) {
        // for matched user
        can(Action.ACCESS, PlaidApi);
        can(Action.MODIFY, UserPlaidBankAccount);
        can(Action.ACCESS, UserPlaidItem);
      }
    }

    return build({
      resolveAction,
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  execPolicyHandler({
    handler,
    ability,
    context,
  }: {
    handler: PolicyHandler;
    ability: AppAbility;
    context: ExecutionContext;
  }) {
    if (typeof handler === 'function') {
      return handler(ability, context);
    }
    return handler.handle(ability, context);
  }

  execPolicyHandlerFactory(ability: AppAbility, context: ExecutionContext) {
    return (handler: PolicyHandler) =>
      this.execPolicyHandler({ handler, ability, context });
  }

  public async checkPolicyAccess({
    requestUser,
    userId,
    action,
    subject,
    canParams,
  }: CheckPolicyAccessProps): Promise<boolean> {
    const ability = await this.createForRequestUser({
      requestUser,
      isMatchedUser: userId === requestUser.uuid,
    });

    if (canParams) {
      return canParams.reduce<boolean>(
        (permitted, canParam) =>
          permitted &&
          ability.can(canParam.action, canParam.subject, canParam.field),
        true
      );
    }

    return ability.can(action, subject);
  }

  public async canAccessOrFail({
    ForbiddenError = ForbiddenException,
    ...args
  }: CheckPolicyAccessProps & {
    ForbiddenError?: typeof ForbiddenException;
  }): Promise<void> {
    const hasAccess = await this.checkPolicyAccess(args);
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }
  }
}
