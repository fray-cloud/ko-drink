import { UpdatePasswordDto } from '../dto/update-password.dto';

export class UpdatePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdatePasswordDto,
  ) {}
}
