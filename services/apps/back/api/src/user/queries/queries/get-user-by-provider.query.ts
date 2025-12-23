import type { Provider } from '@ko-drink/shared';

export class GetUserByProviderQuery {
  constructor(
    public readonly provider: Provider,
    public readonly providerId: string,
  ) {}
}
