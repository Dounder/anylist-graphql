import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superUser = 'super_user',
}

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'Ea anim ad amet qui qui.',
});
