import { ArgsType, Field } from '@nestjs/graphql';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserPlaidIdentifierInput } from './userPlaidIdentifier.input';

@ArgsType()
export class GetUserPlaidLinkedItemsArgs {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => UserPlaidIdentifierInput)
  @Field(() => [UserPlaidIdentifierInput], { nullable: true })
  plaidBankAccountList?: UserPlaidIdentifierInput[] = undefined;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  forACHFunding: boolean = undefined;
}
