// src/lecturer/lecturer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecturer } from './lecturer.entity';
import { LecturerService } from './lecturer.service';
import { LecturerController } from './lecturer.controller';
import { LecturerRepository } from './lecturer.repository';
import { AssignedLecturerModule } from 'src/assign-lecturer/assign-lecturer.module';

@Module({
  imports: [
    // Đăng ký Entity cho Lecturer
    TypeOrmModule.forFeature([Lecturer]),
    AssignedLecturerModule,
  ],
  controllers: [LecturerController],
  providers: [
    LecturerService,
    LecturerRepository,
  ],
  exports: [LecturerService, LecturerRepository], // Export để AssignmentModule có thể dùng nếu cần
})
export class LecturerModule {}