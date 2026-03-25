import { Injectable, NotFoundException, InternalServerErrorException, Logger } from "@nestjs/common";
import { AssignedLecturerRepository } from "src/assign-lecturer/assign-lecturer.repository";
import { Lecturer } from "./lecturer.entity";
import { LecturerRepository } from "./lecturer.repository";
import { UpdateExpertiseDto } from "./lecturer.do";

@Injectable()
export class LecturerService {
  
  private readonly logger = new Logger(LecturerService.name);
  constructor(
    private readonly lecturerRepo: LecturerRepository,
    private readonly assignedRepo: AssignedLecturerRepository
  ) { }

  async getProfile(id: number): Promise<Lecturer> {
    const lecturer = await this.lecturerRepo.findById(id);
    if (!lecturer) throw new NotFoundException('Giảng viên không tồn tại.');
    return lecturer;
  }

  // Chức năng: Cập nhật trình độ/Chuyên môn
  async updateExpertise(id: number, dto: UpdateExpertiseDto): Promise<Lecturer> {
    const lecturer = await this.getProfile(id);

    lecturer.degree = dto.degree;
    lecturer.specialization = dto.specialization;

    const updated = await this.lecturerRepo.save(lecturer);
    if (!updated) throw new InternalServerErrorException('Không thể cập nhật chuyên môn.');
    return updated;
  }

  // Chức năng: Thống kê hoạt động giảng dạy (Phần thuộc module Academic)
  async getTeachingStats(id: number): Promise<any> {
    await this.getProfile(id); // Check lecturer exists
    const courseCount = await this.assignedRepo.countCoursesByLecturer(id);

    return {
      lecturerId: id,
      totalAssignedCourses: courseCount || 0,
      // Lưu ý: Số bài giảng sẽ được lấy qua API Gateway từ module Curriculum
    };
  }

  async findAll(): Promise<Lecturer[]> {
    const lecturers = await this.lecturerRepo.findAll();

    if (!lecturers || lecturers.length === 0) {
      throw new NotFoundException('Danh sách giảng viên trống.');
    }

    return lecturers;
  }

  /**
   * Xử lý khi Admin cấp quyền lecturer cho một User
   */
  async handleRoleAssigned(data: { id: number; email: string }) {
    const lecturerId = Number(data.id);
    const existinglecturer = await this.lecturerRepo.findById(data.id);

    if (existinglecturer) {
      // Nếu user này trước đây từng là sinh viên (bị khóa, giờ mở lại)
      await this.lecturerRepo.updateStatus(lecturerId, 'ACTIVE');
      this.logger.log(`✅ [lecturer] Kích hoạt lại hồ sơ Học viên ID: ${lecturerId}`);
    } else {
      // Tạo mới hồ sơ học viên
      const lecturerCode = `LECT-${lecturerId.toString().padStart(4, '0')}`;
      const defaultName = data.email.split('@')[0];

      await this.lecturerRepo.createLecturer({
        lecturerId: data.id,
        email: data.email,
        fullname: defaultName,
        lecturerCode: lecturerCode
      })
      this.logger.log(`✅ [lecturer] Tạo mới hồ sơ Học viên ID: ${lecturerId}`);
    }
  }

  /**
   * Vô hiệu hóa hồ sơ khi bị tước quyền
   */
  async deactivatelecturer(lecturerId: number) {
    const existing = await this.lecturerRepo.findById(lecturerId);
    if (existing) {
      const numLecturerId = Number(lecturerId);
      await this.lecturerRepo.updateStatus(numLecturerId, 'INACTIVE');
      this.logger.log(`🚫 [lecturer] Vô hiệu hóa hồ sơ Học viên ID: ${lecturerId}`);
    }
  }

  async findById(userId: number) {
    return await this.lecturerRepo.findById(userId);
  }


  /**
   *  Note:  Khởi tạo một đối tượng lectuer không có fullname, phone, status, studentCode vì có thể những
   * trường này ta không biết trước. sử dung khi muốn đồng bộ dữ liệu ở 2 service
   * @param userId 
   * @param email 
   * @returns 
   */
  async createInitialProfile(userId: number, email: string) {
    return this.lecturerRepo.createLecturer({
      lecturerId: userId,
      email: email,
      fullname:"",
      lecturerCode: `LECT-${userId.toString().padStart(4, '0')}`
    })
  }

  async hardDelete(userId: number) {
    const result = await this.lecturerRepo.delete(userId);
    if (result.affected && result.affected > 0) {
      return { message: `Deleted student with id ${userId}` };
    } else {
      throw new NotFoundException(`Student with id ${userId} not found`);
    }
  }
}