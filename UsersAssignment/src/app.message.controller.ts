import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StudentService } from './student/student.service';
import { LecturerService } from './lecturer/lecturer.service';

@Controller() // Không để prefix api/v1 ở đây
export class AppMessageController {
  private readonly logger = new Logger(AppMessageController.name);
  constructor(
    private readonly studentService: StudentService,
    private readonly lecturerService: LecturerService
  ) { }

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: any) {
    try {
      // KIỂM TRA TRƯỚC KHI INSERT (tránh duplicate)
      const existing = await this.studentService.findByEmail(data.email);
      if (existing) {
        console.log(`⚠️ Student với email ${data.email} đã tồn tại, bỏ qua.`);
        return;
      }

      await this.studentService.createStudentFromUser({
        userId: data.id,
        email: data.email,
        // fullname, phone... có thể để null hoặc lấy từ user sau này
      });

      console.log(`✅ Đã tạo Student cho user ID: ${data.id}`);
    } catch (e) {
      console.error('Lỗi đồng bộ:', e.message);
    }
  }

  @EventPattern('user_role_changed')
  async handleUserRoleChanged(@Payload() data: { id: number; email: string; oldRole: string; newRole: string }) {
    this.logger.log(`📥 [Role Changed] Nhận yêu cầu phân quyền cho User ID: ${data.id} -> ${data.newRole}`);

    try {
      // 1. Nếu Admin cấp quyền HỌC VIÊN
      if (data.newRole === 'STUDENT') {
        await this.studentService.handleRoleAssigned(data);
      }

      // 2. Nếu Admin cấp quyền GIẢNG VIÊN
      else if (data.newRole === 'LECTURER') {
        await this.lecturerService.handleRoleAssigned(data);
      }

      // (Tùy chọn) 3. Xử lý tước quyền nếu chuyển từ Sinh viên -> Giảng viên
      if (data.oldRole === 'STUDENT' && data.newRole !== 'STUDENT') {
        await this.studentService.deactivateStudent(Number(data.id));
      }
      if (data.oldRole === 'LECTURER' && data.newRole !== 'LECTURER') {
        await this.lecturerService.deactivatelecturer(data.id);
      }

    } catch (error) {
      this.logger.error(`❌ Lỗi xử lý đổi Role tại Academic: ${error.message}`);
    }
  }

  
  /**
   * Chiến lược Lazy Synchronization: xử lý lỗi dữ liệu mất đồng bộ ở 2 service
   * thường xảy ra do con người (insert vào bảng không chính xác) hoặc do
   * hệ thống (network fail giữa chừng) dựa trên nguyên lý Single Source of Truth (Nguồn chân lý duy nhất)
   * Hệ thống sẽ không làm gì cả cho đến khi người dùng ID 47 thực hiện hành động Đăng nhập
   * Khi đó, Account Service ngoài việc trả về Token, nó sẽ bắn luôn một event qua RabbitMQ tên là 
   * user_logged_in với payload: { id: 47, email: 'lecturer@...', role: 'LECTURER' }.
   * Academic Service hứng event này và kiểm tra "sức khỏe" dữ liệu:
   * Nó thấy payload ghi Role là LECTURER.
   * Nó query tìm ID 47 trong bảng lecturers -> Không thấy!
   * Nó query tìm ID 47 trong bảng students -> Thấy có dữ liệu!
   * Hành động tự sửa lỗi: Academic Service lập tức DELETE (hoặc chuyển status thành INACTIVE) 
   * dòng dữ liệu ID 47 bên bảng students, sau đó INSERT một dòng mới tinh cho ID 47 sang bảng lecturers
   * @async
   * @param {({ id: number | number; email: string; role: string })} data 
   * @returns {*} 
   */
  @EventPattern('user_logged_in')
  async handleUserLoggedIn(@Payload() data: { id: number | number; email: string; role: string }) {
    this.logger.log(`🔍 [Data Sync] Kiểm tra đồng bộ cho User ID: ${data.id} - Role: ${data.role}`);
    
    const userId = Number(data.id);

    try {
      if (data.role === 'LECTURER') {
        await this.syncLecturerData(userId, data.email);
      } else if (data.role === 'STUDENT') {
        await this.syncStudentData(userId, data.email);
      }
    } catch (error) {
      this.logger.error(`❌ Lỗi đồng bộ dữ liệu cho User ${userId}: ${error.message}`);
    }
  }

  // --- LOGIC TỰ SỬA LỖI ---
  
  private async syncLecturerData(userId: number, email: string) {
    // 1. Kiểm tra xem đã nằm đúng bảng Giảng viên chưa
    const lecturer = this.lecturerService.findById(userId);
    
    if (!lecturer) {
      this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Lecturers. Đang tự động sửa lỗi...`);
      
      // 2. Dọn rác: Xóa hồ sơ sai ở bảng Học viên (nếu có)
      const wrongStudent = await this.studentService.findById(userId);
      if (wrongStudent) {
        await this.studentService.hardDelete(userId); // Hoặc chuyển status thành INACTIVE tùy nghiệp vụ
        this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Students.`);
      }

      // 3. Chữa lành: Tạo hồ sơ đúng bên bảng Giảng viên
      await this.lecturerService.createInitialProfile(userId, email);
      this.logger.log(`✅ Đã tạo mới hồ sơ Giảng viên cho User ${userId}.`);
    }
  }

  private async syncStudentData(userId: number, email: string) {
    // Logic tương tự nhưng ngược lại: Kiểm tra bảng Student, nếu thiếu thì xóa rác ở bảng Lecturer và tạo mới ở Student
    const student = await this.studentService.findById(userId);
    if (!student) {
      this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Students. Đang tự động sửa lỗi...`);
      
      const wrongLecturer = await this.lecturerService.findById(userId);
      if (wrongLecturer) {
        await this.lecturerService.hardDelete(userId);
        this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Lecturers.`);
      }

      await this.studentService.createInitialProfile(userId, email);
      this.logger.log(`✅ Đã tạo mới hồ sơ Học viên cho User ${userId}.`);
    }
  }
}