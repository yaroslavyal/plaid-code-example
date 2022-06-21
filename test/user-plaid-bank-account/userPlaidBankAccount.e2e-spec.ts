import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { JWKSMock } from 'mock-jwks';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { AuthConfig } from '../../src/auth/auth.config';
import { authConfigValue } from '../utils/mocks/authConfig';
import { PlaidService } from '../../src/plaid/plaid.service';
import { UserPlaidBankAccount } from '../../src/user-plaid-bank-account/entities/userPlaidBankAccount.entity';
import { cleanUpTables, withRequestContext } from '../utils/ormUtils';
import { MikroORM } from '@mikro-orm/core';
import { UserPlaidBankAccountService } from '../../src/user-plaid-bank-account/userPlaidBankAccount.service';
import { groupModuleGet } from '../utils/testingModule';
import { UserPlaidItemService } from '../../src/user-plaid-item/userPlaidItem.service';
import faker from '@faker-js/faker';
import { AccountSubtype, AccountType } from 'plaid';
import { runGqlRequest } from '../utils/graphql';
import { HttpStatus } from '@nestjs/common';
import { expectUnauthorizedGqlErr } from '../utils/expect';
import { createUserAuthToken } from '../utils/userAuthToken';
import { UserPlaidItem } from '../../src/user-plaid-item/entities/userPlaidItem.entity';

type ModuleServices = {
  orm: MikroORM;
  userPlaidBankAccountService: UserPlaidBankAccountService;
  userPlaidItemService: UserPlaidItemService;
};

describe('UserPlaidBankAccount(e2e)', () => {
  let services: ModuleServices;
  let app: NestFastifyApplication;
  let jwks: JWKSMock;
  let exchangePublicTokenMock: jest.Mock;
  let getAccountListMock: jest.Mock;
  let getInstitutionMock: jest.Mock;

  beforeAll(async () => {
    exchangePublicTokenMock = jest.fn();
    getAccountListMock = jest.fn();
    getInstitutionMock = jest.fn();

    const result = await startTestServer({
      override: (builder) =>
        builder
          .overrideProvider(AuthConfig)
          .useValue(authConfigValue)
          .overrideProvider(PlaidService)
          .useValue({
            exchangePublicToken: exchangePublicTokenMock,
            getAccountList: getAccountListMock,
            getInstitutionById: getInstitutionMock,
          }),
    });

    app = result.app;
    jwks = result.jwks;

    services = groupModuleGet<ModuleServices>({
      module: app,
      requestedInstance: {
        orm: MikroORM,
        userPlaidBankAccountService: UserPlaidBankAccountService,
        userPlaidItemService: UserPlaidItemService,
      },
    });
  });

  beforeAll(async () =>
    withRequestContext(services.orm.em, async () => {
      await cleanUpTables(services.orm, [UserPlaidBankAccount, UserPlaidItem]);
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () =>
    withRequestContext(services.orm.em, async () => {
      await cleanUpTables(services.orm, [UserPlaidBankAccount, UserPlaidItem]);
    })
  );

  afterAll(async () => {
    await stopTestServer(app, jwks);
  });

  describe('getUserPlaidBankAccounts graphql query', () => {
    let bankAccounts: UserPlaidBankAccount[];
    let userId: string;
    const query = `
      query {
        getUserPlaidBankAccounts {
          id
          accountId
          accountMask
          accountName
          accountSubtype
          accountType
          forACHFunding
          plaidItem {
            id
            institutionId
            institutionName
          }
          userId
          verificationStatus
        }
      }
    `;

    beforeEach(() =>
      withRequestContext(services.orm.em, async () => {
        userId = faker.datatype.uuid();

        const plaidItem = services.userPlaidItemService.create({
          itemId: faker.datatype.uuid(),
          institutionId: faker.datatype.uuid(),
          institutionName: faker.company.companyName(),
          userId,
          accessToken: faker.datatype.uuid(),
        });
        const bankAccountProps = [
          {
            accountType: AccountType.Depository,
            accountSubtype: AccountSubtype.Savings,
          },
          {
            accountType: AccountType.Depository,
            accountSubtype: AccountSubtype.Checking,
          },
          {
            accountType: AccountType.Investment,
            accountSubtype: AccountSubtype.Roth401k,
          },
          {
            accountType: AccountType.Investment,
            accountSubtype: AccountSubtype.Brokerage,
          },
          {
            accountType: AccountType.Credit,
            accountSubtype: AccountSubtype.CreditCard,
          },
          {
            accountType: AccountType.Loan,
            accountSubtype: AccountSubtype.Mortgage,
          },
        ];

        bankAccounts = bankAccountProps.map((props) =>
          services.userPlaidBankAccountService.create({
            userId,
            plaidItem,
            accountId: faker.datatype.uuid(),
            accountName: faker.finance.accountName(),
            accountMask: faker.finance.mask(),
            accountType: props.accountType,
            accountSubtype: props.accountSubtype,
          })
        );

        await services.userPlaidBankAccountService.persistAndFlush(
          bankAccounts
        );
      })
    );

    it('throws unauthorized error due to missing auth token', async () => {
      const response = await runGqlRequest({ app, query }).expect(
        HttpStatus.OK
      );
      expectUnauthorizedGqlErr(response);
    });

    it('returns list of bank accounts based on auth token', async () => {
      const email = faker.internet.email();
      const authToken = createUserAuthToken(jwks, {
        authConfig: authConfigValue,
        userId,
        email,
      });
      const response = await runGqlRequest({ app, query, authToken }).expect(
        HttpStatus.OK
      );
      const data = response.body?.data?.getUserPlaidBankAccounts;

      expect(data).toBeArrayOfSize(bankAccounts.length);
      expect(data).toEqual(
        expect.arrayContaining(
          bankAccounts.map((account) =>
            expect.objectContaining({ id: account.id })
          )
        )
      );
    });
  });
});
