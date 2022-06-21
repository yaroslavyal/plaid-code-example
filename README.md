# Main Backend

## Description

This example has several modules:
  - auth - for authorization access.
  - plaid - shares Plaid client (see https://plaid.com/) for other services.
  - plaid-link-token - initialises plaid auth link
  - user-plaid-bank-account and user-plaid-item - stores information taken from Plaid.

## Provision

[Provision](./docs/provision.md)

## Use Correct Node Version

[Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if not yet installed

```sh
$ nvm use || nvm install
```

## Api Document

Swagger provides interactive api document at http://localhost:3000/docs.
Graphql Studio provides interactive graphql client at http://lcoalhost:3000/graphql.
