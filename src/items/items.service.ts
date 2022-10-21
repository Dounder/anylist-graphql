import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const item = this.itemRepository.create({ ...createItemInput, user });
    return await this.itemRepository.save(item);
  }

  async findAll(user: User): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOneBy({ id });

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item with id: ${id} not found`);

    return await this.itemRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    const item = await this.findOne(id);

    await this.itemRepository.remove(item);

    return { ...item, id };
  }
}
