# Provision

## Install Correct Node Version

[Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if not yet installed

```sh
$ nvm use || nvm install
```

## Install pnpm package manager

```sh
npm i -g pnpm
```

## Install npm dependencies

```sh
$ pnpm install
```

## Environment Variables

- copy the `.env.example` file to `.env` and modify the permission

  ```sh
  cp .env.example .env
  chmod 640 .env
  ```

## PostgreSQL

- follow [postgress.md](./postgress.md) to setup postgresSQL

- Replace the corresponding env variable values
  ```
  MIKRO_ORM_USER
  MIKRO_ORM_PASSWORD
  ```
