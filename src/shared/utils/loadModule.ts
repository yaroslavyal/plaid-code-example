import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from '../../mikro-orm.config';
import { ConfigModule } from '@nestjs/config';
import loadSecret from '../../config/loadSecret';
import loadEnv from '../../config/loadEnv';
import { CacheModule, DynamicModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  CACHE_GLOBAL_MAX_ITEMS,
  CACHE_GLOBAL_TTL,
  IS_PROD,
} from '../constants';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';

export function loadMikroOrmModule(): DynamicModule {
  return MikroOrmModule.forRoot({ ...config, autoLoadEntities: false });
}

export function loadConfigModule(): DynamicModule {
  return ConfigModule.forRoot({
    load: [loadSecret('secrets'), loadEnv],
    isGlobal: true,
    cache: true,
  });
}

export function loadGraphqlModule(): DynamicModule {
  return GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    debug: !IS_PROD,
    playground: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    disableHealthCheck: true,
    autoSchemaFile: join(process.cwd(), 'graphQL/schema.gql'),
    sortSchema: true,
  });
}

export function loadCacheModule(): DynamicModule {
  return CacheModule.register({
    ttl: CACHE_GLOBAL_TTL,
    max: CACHE_GLOBAL_MAX_ITEMS,
    isGlobal: true,
  });
}
