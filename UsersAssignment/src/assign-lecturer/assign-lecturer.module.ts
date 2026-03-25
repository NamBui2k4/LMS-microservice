// src/assign-lecturer/assign-lecturer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignedLecturer } from './assign-lecturer.entity';
import { AssignedLecturerRepository } from './assign-lecturer.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignedLecturer]),
  ],
  providers: [AssignedLecturerRepository],
  exports: [AssignedLecturerRepository], // Bắt buộc export để Module khác xài ké
})
export class AssignedLecturerModule {}