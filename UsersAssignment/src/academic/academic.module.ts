// src/assignment/academic-assignment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicAssignmentService } from './academic-assign.service';
import { AcademicAssignmentController } from './academic-assign.controller';
import { StudentModule } from '../student/student.module'; // Import StudentModule để dùng Repo
import { Enrollment } from 'src/enrollment/enrollment.entity';
import { AssignedLecturer } from 'src/assign-lecturer/assign-lecturer.entity';
import { EnrollmentRepository } from 'src/enrollment/enrollment.repository';
import { AssignedLecturerRepository } from 'src/assign-lecturer/assign-lecturer.repository';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { AssignedLecturerModule } from 'src/assign-lecturer/assign-lecturer.module';
import { LecturerModule } from 'src/lecturer/lecturer.module';

@Module({
  imports: [
    // 1. Đăng ký Entity của riêng Module này
    TypeOrmModule.forFeature([Enrollment, AssignedLecturer]),
    // 2. Import StudentModule để lấy StudentRepository mà AssignmentService đang cần
    StudentModule,    // Để AcademicAssignmentService gọi được StudentRepository
    EnrollmentModule, 
    AssignedLecturerModule,
    LecturerModule,
  ],
  controllers: [AcademicAssignmentController],
  providers: [
    AcademicAssignmentService,
    EnrollmentRepository,
    AssignedLecturerRepository,
    
  ],
  exports: [AcademicAssignmentService],
})
export class AcademicAssignmentModule {}