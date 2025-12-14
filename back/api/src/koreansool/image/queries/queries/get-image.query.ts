export class GetImageQuery {
  constructor(
    public readonly book: string,
    public readonly liq: string,
    public readonly dup?: number,
  ) {}
}
