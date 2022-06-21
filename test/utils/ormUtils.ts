import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core';
import { EntityName } from '@mikro-orm/core/typings';

export async function withRequestContext<T>(
  em: EntityManager,
  next: (...args: any[]) => Promise<T>
): Promise<T> {
  return await RequestContext.createAsync(em, next);
}

export async function cleanUpTables(orm: MikroORM, tables: EntityName<any>[]) {
  for (const table of tables) {
    await orm.em.nativeDelete(table, {});
  }
}
