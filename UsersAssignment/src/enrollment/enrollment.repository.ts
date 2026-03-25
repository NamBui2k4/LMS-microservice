import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repo: Repository<Enrollment>,
  ) { }

  // Thỏa mãn: Thêm học viên vào khóa học
  async save(enrollment: Enrollment): Promise<Enrollment | null> {
    return this.repo.save(enrollment);
  }

  // Thỏa mãn: Xóa học viên khỏi khóa học
  async remove(studentId: number, courseId: number): Promise<void | null> {
    await this.repo.delete(
      {
        student: { id: studentId },
        id: courseId
      }
    );
    return null;
  }

  async findOne(studentId: number, courseId: number): Promise<Enrollment | null> {
    return this.repo.findOne({
      where: { student: { id: studentId }, id: courseId }
    });
  }


}