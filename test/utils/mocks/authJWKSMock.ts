import createJWKSMock, { JWKSMock } from 'mock-jwks';

export function startJWKSAuthServer(baseUrl: string): JWKSMock {
  const jwks = createJWKSMock(baseUrl, '/.well-known/jwks.json');
  jwks.start();
  return jwks;
}
