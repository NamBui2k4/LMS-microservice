import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { AssignedLecturer } from "../assign-lecturer/assign-lecturer.entity";
import { AssignedLecturerRepository } from "../assign-lecturer/assign-lecturer.repository";
import { Enrollment } from "../enrollment/enrollment.entity";
import { EnrollmentRepository } from "../enrollment/enrollment.repository";
import { StudentRepository } from "../student/student.repository";
import { AssignLecturerDto } from "../assign-lecturer/assign.dto";
import { EnrollStudentDto } from "../enrollment/enrollment.dto";

@Injectable()
export class AcademicAssignmentService {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly assignedRepo: AssignedLecturerRepository,
    private readonly studentRepo: StudentRepository
  ) {}

  // Chức năng: Thêm học viên vào khóa học
  async enrollStudent(dto: EnrollStudentDto): Promise<Enrollment> {
    // 1. Kiểm tra học viên tồn tại
    const student = await this.studentRepo.findById(dto.studentId);
    if (!student) throw new NotFoundException('Học viên không tồn tại.');

    // 2. Kiểm tra đã ghi danh chưa (Tránh trùng lặp)
    const existing = await this.enrollmentRepo.findOne(dto.studentId, dto.courseId);
    if (existing) throw new ConflictException('Học viên đã có trong khóa học này.');

    // 3. Thực hiện ghi danh
    const newEnrollment = new Enrollment();
    newEnrollment.studentId = dto.studentId;
    newEnrollment.courseId = dto.courseId;
    
    const saved = await this.enrollmentRepo.save(newEnrollment);
    if (!saved) throw new BadRequestException('Ghi danh thất bại.');
    return saved;
  }

  // Chức năng: Xóa học viên khỏi khóa học
  async unenrollStudent(studentId: number, courseId: number): Promise<void | null> {
    const enrollment = await this.enrollmentRepo.findOne(studentId, courseId);
    if (!enrollment) throw new NotFoundException('Học viên không có trong lớp này.');

    await this.enrollmentRepo.remove(studentId, courseId);
    return null;
  }

  // Chức năng: Phân công giảng viên vào khóa học
  async assignLecturer(dto: AssignLecturerDto): Promise<AssignedLecturer> {
    const assignment = new AssignedLecturer()
    assignment.assignmentRole = dto.role;

    const saved = await this.assignedRepo.save(assignment);
    if (!saved) throw new InternalServerErrorException('Phân công thất bại.');
    return saved;
  }
}