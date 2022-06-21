import { IsString, IsUUID, ValidateIf } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserPlaidIdentifierInput {
  @ValidateIf((o) => !o.userPlaidBankAccountId)
  @IsUUID()
  @Field({ nullable: true })
  id: string = undefined;

  @ValidateIf((o) => !o.id)
  @IsString()
  @Field({ nullable: true })
  userPlaidBankAccountId: string = undefined;
}
