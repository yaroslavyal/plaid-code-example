import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class GetPlaidLinkTokenArgs {
  @IsOptional()
  @IsUUID()
  @Field({ nullable: true })
  itemId: string = undefined;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  enableAccountSelect: boolean = undefined;
}
