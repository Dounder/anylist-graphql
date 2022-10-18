import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { RoleArg } from './dto/args/role.arg';
import { UpdateUserInput } from './dto/update-user.input';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args() validRoles: RoleArg,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User,
  ): Promise<User[]> {
    return await this.usersService.findAll(validRoles.roles);
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
}
