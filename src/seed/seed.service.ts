import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemsService } from 'src/items/items.service';
import { Repository } from 'typeorm';

import { Item } from './../items/entities/item.entity';
import { ListItem } from './../list-item/entities/list-item.entity';
import { ListItemService } from './../list-item/list-item.service';
import { List } from './../lists/entities/list.entity';
import { ListsService } from './../lists/lists.service';
import { User } from './../users/entities/user.entity';
import { UsersService } from './../users/users.service';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
    private readonly listService: ListsService,
    private readonly listItemService: ListItemService,
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

    //* Create lists
    const list = await this.loadLists(user);

    //* Create lists items
    const items = await this.itemService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabase() {
    //! Delete listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    //! Delete lists
    await this.listRepository.createQueryBuilder().delete().where({}).execute();
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
    const itemsToCreate = SEED_ITEMS.map((item) =>
      this.itemService.create(item, user),
    );
    await Promise.all(itemsToCreate);
  }

  async loadLists(user: User): Promise<List> {
    const lists = SEED_LISTS.map((list) => this.listService.create(list, user));
    const [list] = await Promise.all(lists);
    return list;
  }

  async loadListItems(list: List, items: Item[]) {
    const listItems = items.map((item) =>
      this.listItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0 ? false : true,
        listId: list.id,
        itemId: item.id,
      }),
    );
    await Promise.all(listItems);
  }
}
