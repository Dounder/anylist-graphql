import { ParseUUIDPipe } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  // @Query(() => User, { name: 'user' })
  // async findOne(
  //   @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  // ): Promise<User> {
  //   return await this.usersService.findOne(id);
  // }

  @Mutation(() => User)
  async blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<User> {
    return await this.usersService.block(id);
  }
}
