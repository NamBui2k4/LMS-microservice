import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.enum';

@Controller('api/v1/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Chỉ ADMIN mới được xem log hệ thống
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * LẤY DANH SÁCH NHẬT KÝ HỆ THỐNG
   * GET /api/v1/audit-logs
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getLogs(@Query() query: any) {
    const logs = await this.auditLogService.getLogs(query);
    return {
      message: 'Tải danh sách nhật ký thành công.',
      data: logs,
    };
  }
}