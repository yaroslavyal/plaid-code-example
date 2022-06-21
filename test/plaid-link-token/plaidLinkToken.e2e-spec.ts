import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { JWKSMock } from 'mock-jwks';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { AuthConfig } from '../../src/auth/auth.config';
import { authConfigValue } from '../utils/mocks/authConfig';
import { PlaidService } from '../../src/plaid/plaid.service';
import { runGqlRequest } from '../utils/graphql';
import { HttpStatus } from '@nestjs/common';
import {
  expectUnauthorizedGqlErr,
  expectUserInputGqlErr,
} from '../utils/expect';
import faker from '@faker-js/faker';
import { createUserAuthToken } from '../utils/userAuthToken';
import { UserPlaidItem } from '../../src/user-plaid-item/entities/userPlaidItem.entity';
import { cleanUpTables, withRequestContext } from '../utils/ormUtils';
import { MikroORM } from '@mikro-orm/core';
import { UserPlaidItemService } from '../../src/user-plaid-item/userPlaidItem.service';
import { groupModuleGet } from '../utils/testingModule';

type ModuleServices = {
  orm: MikroORM;
  userPlaidItemService: UserPlaidItemService;
};

describe('PlaidLinkToken(e2e)', () => {
  let services: ModuleServices;
  let app: NestFastifyApplication;
  let jwks: JWKSMock;
  let createLinkTokenMock: jest.Mock;

  beforeAll(async () => {
    createLinkTokenMock = jest.fn();

    const result = await startTestServer({
      override: (builder) =>
        builder
          .overrideProvider(AuthConfig)
          .useValue(authConfigValue)
          .overrideProvider(PlaidService)
          .useValue({
            createLinkToken: createLinkTokenMock,
          }),
    });

    app = result.app;
    jwks = result.jwks;

    services = groupModuleGet<ModuleServices>({
      module: app,
      requestedInstance: {
        orm: MikroORM,
        userPlaidItemService: UserPlaidItemService,
      },
    });
  });

  beforeAll(async () =>
    withRequestContext(services.orm.em, async () => {
      await cleanUpTables(services.orm, [UserPlaidItem]);
    })
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () =>
    withRequestContext(services.orm.em, async () => {
      await cleanUpTables(services.orm, [UserPlaidItem]);
    })
  );

  afterAll(async () => {
    await stopTestServer(app, jwks);
  });

  describe('getPlaidLinkToken graphql query', () => {
    let email: string;
    let userId: string;
    let authToken: string;

    const query = `
      query($itemId: String) {
        getPlaidLinkToken(itemId: $itemId)
      }
    `;

    beforeEach(() => {
      email = faker.internet.email();
      userId = faker.datatype.uuid();
      authToken = createUserAuthToken(jwks, {
        authConfig: authConfigValue,
        userId,
        email,
      });
    });

    it('throws unauthorized error due to missing auth token', async () => {
      const response = await runGqlRequest({ app, query }).expect(
        HttpStatus.OK
      );
      expectUnauthorizedGqlErr(response);
    });

    describe('create token for new plaid item', () => {
      it('returns token based on auth token', async () => {
        const linkToken = faker.datatype.uuid();
        createLinkTokenMock.mockResolvedValueOnce({
          link_token: linkToken,
        });
        const response = await runGqlRequest({
          app,
          query,
          authToken,
        }).expect(HttpStatus.OK);
        expect(createLinkTokenMock).toBeCalledTimes(1);
        expect(createLinkTokenMock).toBeCalledWith({ userId });
        expect(response.body?.data?.getPlaidLinkToken).toEqual(linkToken);
      });
    });

    describe('create token for existing plaid item', () => {
      let item: UserPlaidItem;

      beforeEach(async () =>
        withRequestContext(services.orm.em, async () => {
          item = services.userPlaidItemService.create({
            userId,
            itemId: faker.datatype.uuid(),
            accessToken: faker.datatype.uuid(),
            institutionId: faker.datatype.uuid(),
            institutionName: faker.finance.account(),
          });

          await services.userPlaidItemService.persistAndFlush(item);
        })
      );

      it('throws user input error due to invalid input args', async () => {
        const response = await runGqlRequest({
          app,
          query,
          authToken,
          variables: {
            itemId: 'itemId',
          },
        }).expect(HttpStatus.OK);
        expectUserInputGqlErr({ response, keys: ['itemId'] });
      });

      it('returns token based on auth token and input args', async () => {
        const linkToken = faker.datatype.uuid();
        createLinkTokenMock.mockResolvedValueOnce({
          link_token: linkToken,
        });
        const response = await runGqlRequest({
          app,
          query,
          authToken,
          variables: {
            itemId: item.id,
          },
        }).expect(HttpStatus.OK);

        expect(createLinkTokenMock).toBeCalledTimes(1);
        expect(createLinkTokenMock).toBeCalledWith({
          userId,
          accessToken: item.accessToken,
        });
        expect(response.body?.data?.getPlaidLinkToken).toEqual(linkToken);
      });
    });
  });
});
