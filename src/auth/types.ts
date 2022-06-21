import { Ability } from '@casl/ability';
import { ExecutionContext } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { UserPlaidBankAccount } from '../user-plaid-bank-account/entities/userPlaidBankAccount.entity';
import { PlaidApi } from 'plaid';
import { UserPlaidItem } from '../user-plaid-item/entities/userPlaidItem.entity';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

export enum Action {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ACCESS = 'access',
  MODIFY = 'modify',
}

export type Subjects =
  | typeof PlaidApi
  | PlaidApi
  | typeof UserPlaidBankAccount
  | UserPlaidBankAccount
  | UserPlaidItem
  | typeof UserPlaidItem
  | CognitoUserPool
  | typeof CognitoUserPool
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

type PolicyHandlerCallback = (
  ability: AppAbility,
  context: ExecutionContext
) => boolean;

interface PolicyHandlerObject {
  handle: PolicyHandlerCallback;
}

export type PolicyHandler = PolicyHandlerObject | PolicyHandlerCallback;

export interface RequestUserInfo {
  uuid: string;
  identity: string;
  roles: Roles[];
}

export enum Roles {
  Admin = 'Admin',
}

registerEnumType(Roles, {
  name: 'Roles',
  description: 'available user roles',
});
