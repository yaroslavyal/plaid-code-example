import { AuthConfig } from '../../src/auth/auth.config';
import { JWKSMock } from 'mock-jwks';

export function createUserAuthToken(
  jwks: JWKSMock,
  {
    authConfig,
    typeToken = 'id',
    userId,
    email,
    groups,
  }: {
    authConfig: Omit<AuthConfig, 'configService'>;
    typeToken?: 'id' | 'access';
    userId: string;
    email: string;
    groups?: string[];
  }
): string {
  const payload: Record<string, any> = {
    token_use: typeToken,
    iss: authConfig.authority,
    sub: userId,
    ...(typeToken === 'id'
      ? { aud: authConfig.clientId, email: email }
      : { client_id: authConfig.clientId, username: email }),
  };

  if (groups) {
    payload['cognito:groups'] = groups;
  }

  const token = jwks.token(payload);

  return token;
}
