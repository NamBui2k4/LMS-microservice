import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<RefreshToken>): Promise<RefreshToken | null> {
    const newToken = this.refreshTokenRepo.create(data);
    return this.refreshTokenRepo.save(newToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOne({
      where: { token },
      relations: ['user'], // Join với User để biết token này của ai
    });
  }

  async revoke(id: number): Promise<RefreshToken | null> {
    await this.refreshTokenRepo.update(id, { isRevoked: true });
    return this.refreshTokenRepo.findOne({ where: { id } });
  }

  async revokeAllForUser(userId: string): Promise<void | null> {
    await this.refreshTokenRepo.update(
      { user: { id: userId } }, 
      { isRevoked: true }
    );
    return null;
  }
}