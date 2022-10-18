import { ValidRoles } from './../../../auth/enums/valid-roles.enum';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

@ArgsType()
export class RoleArg {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray()
  roles: ValidRoles[] = [];
}
