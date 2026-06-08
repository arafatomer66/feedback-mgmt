import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  findAll() {
    return this.repo.find({ select: { id: true, name: true, email: true, role: true, avatar_url: true, created_at: true } });
  }
}
