import { AuthConfig } from '../../../src/auth/auth.config';

// these fake values help to initialize CognitoUserPool in AuthService
export const authConfigValue: Omit<AuthConfig, 'configService'> = {
  userPoolId: 'us-west-2_testpool1',
  clientId: 'test-clientId',
  region: 'us-west-2',
  authority: 'https://test1authority.test',
};
