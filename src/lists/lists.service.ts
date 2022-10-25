import { SearchArgs } from './../common/dto/args/search.args';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationArgs } from './../common/dto/args/pagination.args';
import { User } from './../users/entities/user.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { List } from './entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const list = this.listRepository.create({ ...createListInput, user });
    return await this.listRepository.save(list);
  }

  async findAll(
    user: User,
    pagination: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<List[]> {
    const { limit, offset } = pagination;
    const { search } = searchArgs;

    const query = this.listRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"userId" = :userId', { userId: user.id });

    if (search) query.andWhere(`name ilike :name`, { name: `%${search}%` });

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listRepository.findOneBy({
      id,
      user: { id: user.id },
    });

    if (!list) throw new NotFoundException(`List with id ${id}, not found`);

    return list;
  }

  async update(
    id: string,
    updateListInput: UpdateListInput,
    user: User,
  ): Promise<List> {
    await this.findOne(id, user);
    const list = await this.listRepository.preload({
      ...updateListInput,
      user,
    });
    if (!list) throw new NotFoundException(`List with id ${id}, not found`);
    return await this.listRepository.save(list);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user);

    await this.listRepository.remove(list);

    return { ...list, id };
  }

  async getListsByUser(user: User): Promise<number> {
    return await this.listRepository.countBy({ user: { id: user.id } });
  }
}
