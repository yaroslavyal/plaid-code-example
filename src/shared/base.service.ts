import {
  AnyEntity,
  EntityData,
  FilterQuery,
  FindOneOptions,
  FindOneOrFailOptions,
  FindOptions,
  Loaded,
  RequiredEntityData,
  DeleteOptions,
  DriverException,
  EntityManager,
  UpdateOptions,
  ObjectQuery,
} from '@mikro-orm/core';
import { pick } from 'lodash';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestError, NotFoundError } from './errors';
import { CountOptions } from '@mikro-orm/core/drivers/IDatabaseDriver';
import {
  createMappedPropertySet,
  getStringifiedEntries,
  PropertySerializer,
} from './utils/object';

@Injectable()
export abstract class BaseService<T> {
  protected abstract logger: Logger;
  constructor(private readonly genericRepository: EntityRepository<T>) {
    this.catchError = this.catchError.bind(this);
  }

  private catchError<T>(err: unknown): T {
    this.logger.error(JSON.stringify(err));
    if (err instanceof DriverException) {
      throw new BadRequestError('Database exception');
    }
    throw err;
  }

  findAll<P extends string = never>(
    options?: FindOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    return this.genericRepository
      .findAll(options)
      .catch<Loaded<T, P>[]>(this.catchError);
  }

  find<P extends string = never>(
    where: FilterQuery<T>,
    options?: FindOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    return this.genericRepository
      .find(where, options)
      .catch<Loaded<T, P>[]>(this.catchError);
  }

  findOne<P extends string = never>(
    where: FilterQuery<T>,
    options?: FindOneOptions<T, P>
  ): Promise<Loaded<T, P> | null> {
    return this.genericRepository
      .findOne(where, options)
      .catch<Loaded<T, P> | null>(this.catchError);
  }

  findOneOrFail<P extends string = never>(
    where: FilterQuery<T>,
    options?: FindOneOrFailOptions<T, P>
  ): Promise<Loaded<T, P>> {
    return this.genericRepository
      .findOneOrFail(where, options)
      .catch<Loaded<T, P>>(this.catchError);
  }

  create(data: RequiredEntityData<T>): T {
    return this.genericRepository.create(data);
  }

  async persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    return this.genericRepository
      .persistAndFlush(entity)
      .catch<void>(this.catchError);
  }

  async save(entity: T): Promise<T> {
    try {
      const mergedEntity = this.genericRepository.create(entity);
      await this.genericRepository.persistAndFlush(mergedEntity);
      return entity;
    } catch (err) {
      this.catchError(err);
    }
  }

  remove(entity: AnyEntity | AnyEntity[]): EntityManager {
    return this.genericRepository.remove(entity);
  }

  public async upsert({
    data,
    where,
    flush = false,
  }: {
    data: RequiredEntityData<T>;
    where: FilterQuery<T>;
    flush?: boolean;
  }) {
    try {
      let entity: T = await this.genericRepository.findOne(where);
      if (entity) {
        this.genericRepository.assign(entity, data);
      } else {
        entity = this.genericRepository.create(data);
      }

      if (flush) {
        await this.genericRepository.persistAndFlush(entity);
      } else {
        await this.genericRepository.persist(entity);
      }
      return entity;
    } catch (err) {
      this.catchError(err);
    }
  }

  public async upsertManyFilteredByProperties<K extends keyof EntityData<T>>({
    data,
    propertyList,
    propertySerializer,
    flush = false,
  }: {
    data: RequiredEntityData<T>[];
    propertyList: K[];
    propertySerializer?: PropertySerializer<T, K>;
    flush?: boolean;
  }) {
    try {
      const orFilters = data.map((datum) => pick(datum, propertyList));
      const where: any = { $or: orFilters };
      const existingEntityList: T[] = await this.genericRepository.find(where);
      const existingEntityMapObj: Record<string, T> = createMappedPropertySet(
        existingEntityList,
        propertyList,
        propertySerializer
      );

      const entityList: T[] = data.map((datum, i) => {
        const key: string = getStringifiedEntries(
          orFilters[i],
          propertySerializer
        );
        let entity: T = existingEntityMapObj[key];
        if (entity) {
          this.genericRepository.assign(entity, datum);
        } else {
          entity = this.genericRepository.create(datum);
        }

        return entity;
      });

      if (flush) {
        await this.genericRepository.persistAndFlush(entityList);
      } else {
        await this.genericRepository.persist(entityList);
      }

      return entityList;
    } catch (err) {
      this.catchError(err);
    }
  }

  async nativeDelete(
    where: FilterQuery<T>,
    options?: DeleteOptions<T>
  ): Promise<number> {
    return this.genericRepository
      .nativeDelete(where, options)
      .catch<number>(this.catchError);
  }

  persist(entity: AnyEntity | AnyEntity[]): EntityManager {
    return this.genericRepository.persist(entity);
  }

  assign(entity: T, data: EntityData<T>): T {
    return this.genericRepository.assign(entity, data);
  }

  findOneActiveOrFail<P extends string = never>(
    where: ObjectQuery<T>,
    options?: FindOneOrFailOptions<T, P>
  ): Promise<Loaded<T, P>> {
    const filterQuery: FilterQuery<T> = {
      active: true,
      ...where,
    } as FilterQuery<T>;
    return this.genericRepository
      .findOneOrFail(filterQuery, {
        failHandler: (): any => new NotFoundError('Entity not found'),
        ...options,
      })
      .catch<Loaded<T, P>>(this.catchError);
  }

  getActiveById<P extends string = never>(
    id: string,
    options?: FindOneOrFailOptions<T, P>
  ): Promise<T>;
  getActiveById<P extends string = never>(
    id: string,
    userId: string,
    options?: FindOneOrFailOptions<T, P>
  ): Promise<T>;
  getActiveById<P extends string = never>(
    id: string,
    arg1?: string | FindOneOrFailOptions<T, P>,
    arg2?: FindOneOrFailOptions<T, P>
  ): Promise<T> {
    const filterQuery: any = { id };
    let options;

    if (arg1 && typeof arg1 === 'string') {
      filterQuery.userId = arg1;
      options = arg2;
    } else {
      options = arg1;
    }

    return this.findOneActiveOrFail(filterQuery as ObjectQuery<T>, options);
  }

  getById(id: string): Promise<T>;
  getById(id: string, userId: string): Promise<T>;
  getById(id: string, userId?: string): Promise<T> {
    const filterQuery: { id: string; userId?: string } = { id };
    if (userId) {
      filterQuery.userId = userId;
    }

    return this.genericRepository
      .findOneOrFail(filterQuery as FilterQuery<T>, {
        failHandler: (): any => new NotFoundError('Entity not found'),
      })
      .catch<T>(this.catchError);
  }

  nativeUpdate(
    where: FilterQuery<T>,
    data: EntityData<T>,
    options?: UpdateOptions<T>
  ): Promise<number> {
    return this.genericRepository
      .nativeUpdate(where, data, options)
      .catch<number>(this.catchError);
  }

  flush(): Promise<void> {
    return this.genericRepository.flush().catch<void>(this.catchError);
  }

  count(where?: FilterQuery<T>, options?: CountOptions<T>): Promise<number> {
    return this.genericRepository
      .count(where, options)
      .catch<number>(this.catchError);
  }

  findByIdList(idList: string[]): Promise<T[]> {
    return this.genericRepository
      .find({ id: { $in: idList } } as FilterQuery<T>)
      .catch<T[]>(this.catchError);
  }

  getActiveListByIdOrFail<P extends string = never>(
    idList: string[],
    options?: FindOptions<T, P>
  ): Promise<T[]>;
  getActiveListByIdOrFail<P extends string = never>(
    idList: string[],
    userId?: string,
    options?: FindOptions<T, P>
  ): Promise<T[]>;
  async getActiveListByIdOrFail<P extends string = never>(
    idList: string[],
    arg1?: string | FindOptions<T, P>,
    arg2?: FindOptions<T, P>
  ): Promise<T[]> {
    try {
      const uniqIdList = [...new Set(idList)];
      const query: any = { id: { $in: uniqIdList } };
      let options;

      if (arg1 && typeof arg1 === 'string') {
        query.userId = arg1;
        options = arg2;
      } else {
        options = arg1;
      }

      const list = (await this.findActiveList(
        query as ObjectQuery<T>,
        options
      )) as Loaded<T & { id: string }, P>[];

      if (uniqIdList.length !== list.length) {
        const missingId = uniqIdList.find(
          (id) => !list.some((entity) => entity.id === id)
        );
        throw new NotFoundError('Entity not found', {
          id: missingId,
        });
      }

      return list;
    } catch (e) {
      this.catchError(e);
    }
  }

  findActiveList<P extends string = never>(
    where: ObjectQuery<T>,
    options?: FindOptions<T, P>
  ): Promise<Loaded<T, P>[]> {
    return this.genericRepository
      .find({ ...where, active: true }, options)
      .catch<Loaded<T, P>[]>(this.catchError);
  }
}
