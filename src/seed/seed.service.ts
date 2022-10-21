import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from './../items/entities/item.entity';
import { User } from './../users/entities/user.entity';
import { UsersService } from './../users/users.service';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async execute(): Promise<boolean> {
    if (this.isProd)
      throw new UnauthorizedException('Cannot run SEED on production');

    //! Delete all data
    await this.deleteDatabase();

    //? Create users
    const user = await this.loadUser();

    //* Create items
    await this.loadItems(user);

    return true;
  }

  async deleteDatabase() {
    //! Delete items
    await this.itemRepository.createQueryBuilder().delete().where({}).execute();
    //! Delete users
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }

  async loadUser(): Promise<User> {
    const users = SEED_USERS.map((user) => this.userService.create(user));
    const [user] = await Promise.all(users);
    return user;
  }

  async loadItems(user: User) {
    const itemsToCreate = this.itemRepository.create(
      SEED_ITEMS.map((item) => ({ ...item, user })),
    );
    await this.itemRepository.save(itemsToCreate);
  }
}
