// src/enrollment/enrollment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository';
// import { EnrollmentService } from './enrollment.service'; // Nếu bạn có service riêng

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
  ],
  providers: [
    EnrollmentRepository,
    // EnrollmentService, 
  ],
  exports: [EnrollmentRepository], // Export để các Module khác (như Assignment) có thể dùng
})
export class EnrollmentModule {}