// src/data-sync/data-sync.service.ts (Academic Service)
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Dùng để chuyển Observable của RabbitMQ thành Promise
import { StudentService } from './student/student.service';
import { LecturerService } from './lecturer/lecturer.service';

@Injectable()
export class DataSyncService {
  private readonly logger = new Logger(DataSyncService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly studentService: StudentService,
    private readonly lecturerService: LecturerService,
  ) {}

  // ⏰ Cài đặt chạy vào 2:00 sáng mỗi ngày. 
  // (MẸO: Khi test, hãy đổi thành CronExpression.EVERY_MINUTE để xem nó chạy luôn)
  @Cron(CronExpression.EVERY_DAY_AT_2AM) 
  async handleDataReconciliation() {
    this.logger.log('🧹 Bắt đầu chạy chiến dịch Đối soát và Dọn dẹp dữ liệu...');

    try {
      // 1. Gửi yêu cầu sang Account Service và chờ nhận kết quả
      const users = await firstValueFrom(
        this.rabbitClient.send('get_all_users_for_sync', {})
      );

      // 2. Lặp qua từng User để kiểm tra
      let fixedCount = 0;
      for (const user of users) {
        const isFixed = await this.reconcileUser(user);
        if (isFixed) fixedCount++;
      }

      this.logger.log(`✨ Hoàn tất dọn dẹp. Đã tự động sửa lỗi cho ${fixedCount} hồ sơ.`);
    } catch (error) {
      this.logger.error(`❌ Lỗi trong quá trình đối soát: ${error.message}`);
    }
  }

  // --- LOGIC ĐỐI SOÁT (Giống hệt Chiến lược A) ---
  private async reconcileUser(user: any): Promise<boolean> {
    const userId = Number(user.id);
    let isFixed = false;

    if (user.role === 'LECTURER') {
      const lecturer = await this.lecturerService.findById(userId);
      if (!lecturer) {
        // Nếu thiếu bên Giảng viên -> Tìm và xóa bên Học viên (nếu có) -> Tạo mới bên Giảng viên
        await this.studentService.hardDelete(userId); 
        await this.lecturerService.createInitialProfile(userId, user.email);
        this.logger.log(`🔧 Đã sửa lỗi Role cho User ${userId} -> Chuyển thành LECTURER`);
        isFixed = true;
      }
    } 
    else if (user.role === 'STUDENT') {
      const student = await this.studentService.findById(userId);
      if (!student) {
        // Nếu thiếu bên Học viên -> Tìm và xóa bên Giảng viên (nếu có) -> Tạo mới bên Học viên
        await this.lecturerService.hardDelete(userId);
        await this.studentService.createInitialProfile(userId, user.email);
        this.logger.log(`🔧 Đã sửa lỗi Role cho User ${userId} -> Chuyển thành STUDENT`);
        isFixed = true;
      }
    }
    return isFixed;
  }
}