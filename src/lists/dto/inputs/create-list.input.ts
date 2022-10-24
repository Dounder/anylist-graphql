import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;
}
