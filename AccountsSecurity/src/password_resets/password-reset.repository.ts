import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PasswordReset } from './password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordReset)
    private readonly resetRepo: Repository<PasswordReset>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<PasswordReset>): Promise<PasswordReset | null> {
    const newReset = this.resetRepo.create(data);
    return this.resetRepo.save(newReset);
  }

  async findByToken(token: string): Promise<PasswordReset | null> {
    return this.resetRepo.findOne({
      where: { resetToken: token },
      relations: ['user'], // Join sang bảng user để lấy thông tin tài khoản cần đổi pass
    });
  }

  async markAsUsed(id: number): Promise<PasswordReset | null> {
    await this.resetRepo.update(id, { usedAt: new Date() });
    return this.resetRepo.findOne({ where: { id } });
  }
}