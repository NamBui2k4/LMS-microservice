import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserProvider } from './user-provider.entity';

@Injectable()
export class UserProviderRepository {
  constructor(
    @InjectRepository(UserProvider)
    private readonly providerRepo: Repository<UserProvider>,
    private readonly dataSource: DataSource,
  ) {}

  async findByProviderId(providerName: string, providerUserId: string): Promise<UserProvider | null> {
    return this.providerRepo.findOne({
      where: { providerName, providerUserId },
      relations: ['user'], // Join với bảng user để lấy thông tin tài khoản
    });
  }

  async create(providerData: Partial<UserProvider>): Promise<UserProvider | null> {
    const newProvider = this.providerRepo.create(providerData);
    return this.providerRepo.save(newProvider);
  }

  async updateTokens(id: number, accessToken: string, refreshToken: string): Promise<UserProvider | null> {
    await this.providerRepo.update(id, { accessToken, refreshToken });
    return this.providerRepo.findOne({ where: { id } });
  }
}