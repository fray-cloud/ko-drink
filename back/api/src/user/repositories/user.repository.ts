import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Provider } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByProvider(
    provider: Provider,
    providerId: string,
  ): Promise<User | null> {
    return this.repository.findOne({ where: { provider, providerId } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    await this.repository.update(id, updates);
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found after update`);
    }
    return user;
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
