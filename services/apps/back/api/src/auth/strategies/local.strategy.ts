import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ValidateLocalUserQuery } from '../../user/queries/queries/validate-local-user.query';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly queryBus: QueryBus) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.queryBus.execute(
      new ValidateLocalUserQuery(email, password),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, email: user.email, provider: user.provider };
  }
}
