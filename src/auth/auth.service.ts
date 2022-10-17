import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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

    const token = this.getJwtToken(user.id);

    return { token, user };
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.userService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException(
        'Credential are not valids ( email / password )',
      );

    const token = this.getJwtToken(user.id);

    return { token, user };
  }
}
