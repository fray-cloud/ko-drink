export class ValidateLocalUserQuery {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
