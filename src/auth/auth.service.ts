import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './../users/entities/user.entity';

import { UsersService } from './../users/users.service';
import { LoginInput, SignupInput } from './dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(id: string) {
    return this.jwtService.sign({ id });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);

    return { token: this.getJwtToken(user.id), user };
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.userService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException(
        'Credential are not valids ( email / password )',
      );

    return { token: this.getJwtToken(user.id), user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);

    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`);

    delete user.password;

    return user;
  }

  revalidate(user: User) {
    return {
      user,
      token: this.getJwtToken(user.id),
    };
  }
}
