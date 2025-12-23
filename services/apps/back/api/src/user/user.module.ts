import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';

// Commands
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { CreateLocalUserHandler } from './commands/handlers/create-local-user.handler';
import { UpdateUserHandler } from './commands/handlers/update-user.handler';
import { UpdatePasswordHandler } from './commands/handlers/update-password.handler';

// Queries
import { GetUserHandler } from './queries/handlers/get-user.handler';
import { GetUserByEmailHandler } from './queries/handlers/get-user-by-email.handler';
import { GetUserByProviderHandler } from './queries/handlers/get-user-by-provider.handler';
import { ValidateLocalUserHandler } from './queries/handlers/validate-local-user.handler';

const CommandHandlers = [
  CreateUserHandler,
  CreateLocalUserHandler,
  UpdateUserHandler,
  UpdatePasswordHandler,
];

const QueryHandlers = [
  GetUserHandler,
  GetUserByEmailHandler,
  GetUserByProviderHandler,
  ValidateLocalUserHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UserController],
  providers: [UserRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [UserRepository],
})
export class UserModule {}
