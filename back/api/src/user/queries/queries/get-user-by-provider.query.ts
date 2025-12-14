import { Provider } from '../../entities/user.entity';

export class GetUserByProviderQuery {
  constructor(
    public readonly provider: Provider,
    public readonly providerId: string,
  ) {}
}
