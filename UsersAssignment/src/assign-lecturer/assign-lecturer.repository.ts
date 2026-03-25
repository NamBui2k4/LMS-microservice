import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignedLecturer } from './assign-lecturer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssignedLecturerRepository {
  constructor(
    @InjectRepository(AssignedLecturer)
    private readonly repo: Repository<AssignedLecturer>,
  ) {}

  // Thỏa mãn: Xem số lượng khóa học giảng viên đang phụ trách
  async countCoursesByLecturer(lecturerId: number): Promise<number | null> {
    const count = await this.repo.count(
        { 
            where: {
                lecturer: { id:lecturerId } 
            }
        }
    );
    return count;
  }

  async save(assignment: AssignedLecturer): Promise<AssignedLecturer | null> {
    return this.repo.save(assignment);
  }
}