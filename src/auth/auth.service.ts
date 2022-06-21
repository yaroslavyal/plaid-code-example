import { Injectable } from '@nestjs/common';
import { AuthConfig } from './auth.config';
import { Logger } from '@nestjs/common';
import { RequestUserInfo } from './types';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(private readonly authConfig: AuthConfig) {
    this.logger = new Logger(AuthService.name);
  }

  async validateUserWithIdTokenPayload(
    payload: Record<string, any>
  ): Promise<RequestUserInfo> {
    if (
      // must be an id token from the AWS Cognito
      payload.token_use !== 'id' ||
      // must be issued from the same AWS Cognito region
      // (actually this is handled by jwt strategy already)
      this.authConfig.authority !== payload.iss ||
      // must refer to the same AWS Cognito user pool
      this.authConfig.clientId !== payload.aud
    ) {
      return;
    }
    return {
      uuid: payload?.sub,
      identity: payload?.email,
      roles: payload?.['cognito:groups'] ?? [],
    };
  }

  async validateUserWithAccessTokenPayload(
    payload: Record<string, any>
  ): Promise<RequestUserInfo> {
    if (
      // must be an access token from the AWS Cognito
      payload.token_use !== 'access' ||
      // must be issued from the same AWS Cognito region
      // (actually this is handled by jwt strategy already)
      this.authConfig.authority !== payload.iss ||
      // must refer to the same AWS Cognito user pool
      this.authConfig.clientId !== payload.client_id
    ) {
      return;
    }
    return {
      uuid: payload?.sub,
      identity: payload?.username,
      roles: payload?.['cognito:groups'] ?? [],
    };
  }
}
