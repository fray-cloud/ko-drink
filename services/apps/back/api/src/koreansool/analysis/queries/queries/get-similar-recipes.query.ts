export class GetSimilarRecipesQuery {
  constructor(
    public readonly book: string,
    public readonly liq: string,
    public readonly dup: number,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
