import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../user/commands/commands/create-user.command';
import { CreateLocalUserCommand } from '../user/commands/commands/create-local-user.command';
import { GetUserByProviderQuery } from '../user/queries/queries/get-user-by-provider.query';
import type { Provider } from '@ko-drink/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async login(user: any) {
    const payload = {
      userId: user.userId,
      email: user.email,
      provider: user.provider,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerLocal(email: string, password: string, name: string) {
    const user = await this.commandBus.execute(
      new CreateLocalUserCommand({ email, password, name }),
    );
    return this.login({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });
  }

  async validateSocialUser(
    provider: Provider,
    providerId: string,
    email: string,
    name: string,
  ) {
    let user = await this.queryBus.execute(
      new GetUserByProviderQuery(provider, providerId),
    );

    if (!user) {
      user = await this.commandBus.execute(
        new CreateUserCommand({
          email,
          name,
          provider,
          providerId,
        }),
      );
    }

    return this.login({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });
  }
}
