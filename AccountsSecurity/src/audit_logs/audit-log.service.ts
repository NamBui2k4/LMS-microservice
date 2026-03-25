import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuditLogRepository } from './audit-log.repository';
import { CreateAuditLogDto } from './audit-log.dto';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  /**
   * GHI NHẬT KÝ HỆ THỐNG (Dùng nội bộ bởi các Service khác)
   */
  async logAction(dto: CreateAuditLogDto): Promise<void> {
    try {
      // Hàm này không ném lỗi ra ngoài làm hỏng luồng chính (vd: user đang đăng nhập thành công thì không bị chặn lại chỉ vì lỗi ghi log)
      await this.auditLogRepo.create(dto);
    } catch (error) {
      console.error('Lỗi khi ghi Audit Log:', error);
    }
  }

  /**
   * XEM DANH SÁCH NHẬT KÝ (Dành cho Admin)
   */
  async getLogs(query: any): Promise<AuditLog[]> {
    try {
      return await this.auditLogRepo.findAll(query);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tải danh sách nhật ký hệ thống.');
    }
  }
}