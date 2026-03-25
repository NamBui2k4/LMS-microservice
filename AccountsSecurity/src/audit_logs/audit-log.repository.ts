import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    const newLog = this.auditLogRepo.create(data);
    return this.auditLogRepo.save(newLog);
  }

  async findAll(query: any): Promise<AuditLog[]> {
    // Trong thực tế, bạn nên thêm phân trang (Pagination) ở đây
    return this.auditLogRepo.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 100, // Giới hạn lấy 100 dòng mới nhất để tránh quá tải
    });
  }
}