import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserPlaidItem } from './entities/userPlaidItem.entity';

@Injectable()
export class UserPlaidItemService extends BaseService<UserPlaidItem> {
  protected logger: Logger;
  public constructor(
    @InjectRepository(UserPlaidItem)
    private readonly userPlaidItemRepo: EntityRepository<UserPlaidItem>
  ) {
    super(userPlaidItemRepo);
    this.logger = new Logger(UserPlaidItemService.name);
  }
}
