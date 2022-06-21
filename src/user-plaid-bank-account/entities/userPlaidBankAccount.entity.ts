import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  Enum,
  Filter,
  LoadStrategy,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Base } from '../../shared/base.entity';
import { UserPlaidItem } from '../../user-plaid-item/entities/userPlaidItem.entity';
import { AccountSubtype, AccountType } from 'plaid';
import { DecimalType } from '../../shared/db/decimalType';

export const GOOD_FOR_ACH_FUNDING_FILTER = 'goodForFundingFilter';

@ObjectType()
@Entity()
@Filter({
  name: GOOD_FOR_ACH_FUNDING_FILTER,
  cond: (args: { goodSide: boolean }, type) => {
    if (type !== 'read') {
      return {};
    }
    const operator = args.goodSide ? '$in' : '$nin';
    return {
      accountSubtype: {
        [operator]: [AccountSubtype.Savings, AccountSubtype.Checking],
      },
    };
  },
})
export class UserPlaidBankAccount extends Base<UserPlaidBankAccount, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id: string;

  @Field()
  @Property({ type: 'uuid' })
  userId: string;

  @Field()
  @Property({ columnType: 'text' })
  accountId: string;

  @Field()
  @Property({ columnType: 'text' })
  accountName: string;

  @Field()
  @Property({ columnType: 'text' })
  accountType: string;

  @Field()
  @Property({ columnType: 'text', nullable: true })
  accountSubtype: string;

  @Field()
  @Property({ columnType: 'text', nullable: true })
  accountMask: string;

  @Field(() => PlaidLinkedItemVerificationStatus, { nullable: true })
  @Enum({
    items: () => PlaidLinkedItemVerificationStatus,
    nullable: true,
  })
  verificationStatus?: PlaidLinkedItemVerificationStatus; // non-nullable only for micro-deposits auth

  @Field({ nullable: true })
  @Property({ columnType: 'decimal', type: DecimalType, nullable: true })
  balanceAvailable: number;

  @Field({ nullable: true })
  @Property({ columnType: 'decimal', type: DecimalType, nullable: true })
  balanceCurrent: number;

  @Field({ nullable: true })
  @Property({ columnType: 'decimal', type: DecimalType, nullable: true })
  balanceLimit: number;

  @Field({})
  @Property({ length: 3, default: 'USD' })
  currency: string;

  @Field(() => UserPlaidItem)
  @ManyToOne({
    entity: () => UserPlaidItem,
    strategy: LoadStrategy.JOINED,
    eager: true,
  })
  plaidItem: UserPlaidItem;

  @Field(() => Boolean)
  @Property({ persist: false })
  public get forACHFunding(): boolean {
    return (
      this.isDepositoryType &&
      (this.accountSubtype === AccountSubtype.Savings ||
        this.accountSubtype === AccountSubtype.Checking)
    );
  }

  @Property({ persist: false })
  public get isDepositoryType(): boolean {
    return this.accountType === AccountType.Depository;
  }
}

export enum PlaidLinkedItemVerificationStatus {
  AutomaticallyVerified = 'automatically_verified',
  PendingAutomaticVerification = 'pending_automatic_verification',
  PendingManualVerification = 'pending_manual_verification',
  ManuallyVerified = 'manually_verified',
  VerificationExpired = 'verification_expired',
  VerificationFailed = 'verification_failed',
}

registerEnumType(PlaidLinkedItemVerificationStatus, {
  name: 'PlaidLinkedItemVerificationStatus',
  description: 'supported plaid linked item verifications status check',
});
