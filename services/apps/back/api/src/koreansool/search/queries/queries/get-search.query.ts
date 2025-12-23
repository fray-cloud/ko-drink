export class GetSearchQuery {
  constructor(
    public readonly searchText: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
