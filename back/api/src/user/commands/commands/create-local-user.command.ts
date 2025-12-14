import { CreateLocalUserDto } from '../dto/create-local-user.dto';

export class CreateLocalUserCommand {
  constructor(public readonly dto: CreateLocalUserDto) {}
}
