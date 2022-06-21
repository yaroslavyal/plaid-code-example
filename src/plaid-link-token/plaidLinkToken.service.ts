import { Injectable } from '@nestjs/common';
import { GetPlaidLinkTokenArgs } from './dto/getPlaidLinkToken.args';
import { UserPlaidItemService } from '../user-plaid-item/userPlaidItem.service';
import { PlaidService } from '../plaid/plaid.service';

@Injectable()
export class PlaidLinkTokenService {
  public constructor(
    private readonly userPlaidItemService: UserPlaidItemService,
    private readonly plaidService: PlaidService
  ) {}

  public async createLinkToken(
    userId: string,
    args: GetPlaidLinkTokenArgs
  ): Promise<string> {
    let accessToken: string;
    if (args.itemId) {
      const item = await this.userPlaidItemService.getActiveById(
        args.itemId,
        userId
      );
      accessToken = item.accessToken;
    }

    const result = await this.plaidService.createLinkToken({
      userId,
      accessToken,
      enableAccountSelect: args.enableAccountSelect,
    });
    return result.link_token;
  }
}
