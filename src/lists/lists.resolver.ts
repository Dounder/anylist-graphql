import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { PaginationArgs, SearchArgs } from './../common/dto/args';
import { User } from './../users/entities/user.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { List } from './entities/list.entity';
import { ListsService } from './lists.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List)
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return await this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() pagination: PaginationArgs,
    @Args() search: SearchArgs,
  ): Promise<List[]> {
    return await this.listsService.findAll(user, pagination, search);
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return await this.listsService.findOne(id, user);
  }

  @Mutation(() => List)
  async updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User,
  ) {
    return await this.listsService.update(
      updateListInput.id,
      updateListInput,
      user,
    );
  }

  @Mutation(() => List)
  async removeList(
    @Args('id', { type: () => Int }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return await this.listsService.remove(id, user);
  }
}
