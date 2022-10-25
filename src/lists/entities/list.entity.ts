import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './../../users/entities/user.entity';

@Entity('lists')
@ObjectType()
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'text', nullable: false })
  @Field(() => String)
  name: string;

  // relacion, index('userId_list_IX')
  @ManyToOne(() => User, (user) => user.lists, { lazy: true, nullable: false })
  @Index('userId_list_IX')
  @Field(() => User)
  user: User;
}
