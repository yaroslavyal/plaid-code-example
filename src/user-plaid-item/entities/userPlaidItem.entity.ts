import { Base } from '../../shared/base.entity';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Collection,
  Entity,
  Enum,
  LoadStrategy,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { UserPlaidBankAccount } from '../../user-plaid-bank-account/entities/userPlaidBankAccount.entity';

export enum PlaidItemConnectionState {
  Connected = 'Connected',
  Verification = 'Verification',
  LoginRequired = 'LoginRequired',
  PermissionRevoked = 'PermissionRevoked',
  Removed = 'Removed',
}

@ObjectType()
@Entity()
export class UserPlaidItem extends Base<UserPlaidItem, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field()
  @Property({ type: 'uuid' })
  userId: string;

  @Property({ columnType: 'text' })
  accessToken: string;

  @Property({ columnType: 'text' })
  itemId: string;

  @Field({ nullable: true })
  @Property({ columnType: 'text', nullable: true })
  institutionId: string;

  @Field({ nullable: true })
  @Property({ columnType: 'text', nullable: true })
  institutionName: string;

  @Field({ nullable: true })
  @Property({ columnType: 'timestamptz', nullable: true })
  consentExpirationTime?: Date;

  @Field(() => PlaidItemConnectionState, { nullable: true })
  @Enum({
    items: () => PlaidItemConnectionState,
    default: PlaidItemConnectionState.Connected,
  })
  connectionState: PlaidItemConnectionState;

  @Property({ nullable: true })
  errorType?: string;

  @Property({ nullable: true })
  errorCode?: string;

  @OneToMany({
    entity: () => UserPlaidBankAccount,
    mappedBy: (bankAccount) => bankAccount.plaidItem,
    strategy: LoadStrategy.JOINED,
  })
  bankAccounts = new Collection<UserPlaidBankAccount>(this);
}

registerEnumType(PlaidItemConnectionState, {
  name: 'PlaidItemConnectionState',
  description: 'plaid item connection state',
});
