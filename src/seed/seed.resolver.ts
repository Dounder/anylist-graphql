import { Mutation, Resolver } from '@nestjs/graphql';

import { SeedService } from './seed.service';

@Resolver(() => Boolean)
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, {
    name: 'executeSeed',
    description: 'Execute construction of database',
  })
  async executeSeed(): Promise<boolean> {
    return this.seedService.execute();
  }
}
