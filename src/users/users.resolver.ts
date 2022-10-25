import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { PaginationArgs, SearchArgs } from './../common/dto/args';
import { Item } from './../items/entities/item.entity';
import { ItemsService } from './../items/items.service';
import { List } from './../lists/entities/list.entity';
import { ListsService } from './../lists/lists.service';
import { RoleArg } from './dto/args/role.arg';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemService: ItemsService,
    private readonly listService: ListsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args() validRoles: RoleArg,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<User[]> {
    return await this.usersService.findAll(
      validRoles.roles,
      paginationArgs,
      searchArgs,
    );
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User,
  ): Promise<User> {
    return await this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User,
  ) {
    return await this.usersService.update(
      updateUserInput.id,
      updateUserInput,
      user,
    );
  }

  @Mutation(() => User, { name: 'blockUser' })
  async blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return await this.usersService.block(id, user);
  }

  @ResolveField(() => Int, { name: 'itemCount' })
  async getItemCount(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) adminUser: User,
  ): Promise<number> {
    return await this.itemService.getItemByUser(user);
  }

  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return await this.itemService.findAll(user, paginationArgs, searchArgs);
  }

  @ResolveField(() => [List], { name: 'lists' })
  async getListsByUser(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return await this.listService.findAll(user, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listCount' })
  async getListsCount(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) adminUser: User,
  ): Promise<number> {
    return await this.listService.getListsByUser(user);
  }
}
