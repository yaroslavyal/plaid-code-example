import {
  Configuration,
  CountryCode,
  LinkTokenCreateResponse,
  PlaidApi,
  PlaidEnvironments,
  Products,
  ModelError,
  LinkTokenCreateRequest,
} from 'plaid';
import { BadRequestError } from '../shared/errors';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { ApolloError } from 'apollo-server-core';

@Injectable()
export class PlaidService {
  private readonly client: PlaidApi;
  private readonly products: Products[];
  private readonly countryCodes: CountryCode[];
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const headers = {
      'PLAID-CLIENT-ID': this.configService.get('PLAID_CLIENT_ID'),
      'PLAID-SECRET': this.configService.get('PLAID_SECRET'),
      'Plaid-Version': this.configService.get('PLAID_VERSION'),
    };

    const configuration = new Configuration({
      basePath: PlaidEnvironments[this.configService.get('PLAID_ENV')],
      baseOptions: { headers },
    });

    this.client = new PlaidApi(configuration);
    this.products = this.configService
      .get('PLAID_PRODUCTS', '')
      .split(',') as Products[];

    this.countryCodes = this.configService
      .get('PLAID_COUNTRY_CODES', 'US')
      .split(',') as CountryCode[];

    this.logger = new Logger(PlaidService.name);
  }

  private catchError(err: AxiosError | ApolloError | Error): void {
    if (err.isAxiosError) {
      const plaidError: ModelError = err.response?.data;
      this.logger.error(plaidError);
      throw new BadRequestError(
        plaidError?.display_message || plaidError?.error_message,
        plaidError
      );
    } else if (err instanceof ApolloError) {
      this.logger.error(err);
      throw err;
    }

    this.logger.error(`Unknown plaid error - ${err.message}`);
    throw new BadRequestError(`Unknown plaid error - ${err.message}`);
  }

  public async createLinkToken({
    userId,
    accessToken,
    enableAccountSelect,
  }: {
    userId: string;
    accessToken?: string;
    enableAccountSelect?: boolean;
  }): Promise<LinkTokenCreateResponse> {
    const configs: LinkTokenCreateRequest = {
      user: { client_user_id: userId },
      client_name: this.configService.get('PLAID_CLIENT_NAME'),
      products: this.products,
      country_codes: this.countryCodes,
      language: this.configService.get('PLAID_LANGUAGE'),
    };

    if (accessToken) {
      configs.access_token = accessToken;
      configs.products = [];
      if (enableAccountSelect) {
        configs.update = { account_selection_enabled: true };
      }
    }

    try {
      const { data } = await this.client.linkTokenCreate(configs);
      return data;
    } catch (err) {
      this.catchError(err);
    }
    return null;
  }
}
