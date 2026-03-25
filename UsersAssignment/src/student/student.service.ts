import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject } from "@nestjs/common";
import { Student } from "./student.entity";
import { StudentRepository } from "./student.repository";
import { UpdateStudentDto } from "./student.dto";
import { StudentStatus } from "./student.enum";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class StudentService {

  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly studentRepo: StudentRepository,

    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) { }

  async createFromAccount(data: { id: number; email: string; fullname?: string }): Promise<Student> {
    // 1. Kiểm tra xem sinh viên này đã tồn tại chưa (để tránh lỗi duplicate khi RabbitMQ gửi lại tin nhắn)
    const existingStudent = await this.studentRepo.findOne(data.id);

    if (existingStudent) {
      console.log(`⚠️ Sinh viên ID ${data.id} đã tồn tại, bỏ qua tạo mới.`);
      return existingStudent;
    }
    const generatedCode = `STU-${data.id.toString().padStart(4, '0')}`;
    // 2. Tạo instance mới với ID được cấp từ Account Service
    const newStudent = await this.studentRepo.create({
      id: data.id,            // QUAN TRỌNG: Dùng ID từ Account ném sang
      email: data.email,
      fullname: data.fullname || 'Học viên mới',
      status: StudentStatus.UNENROLLED,       // Trạng thái mặc định
      studentCode: generatedCode
    });

    // 3. Lưu vào database của Academic Service
    try {
      console.log(`✅ Đã lưu sinh viên mới vào DB Academic: ID ${newStudent.id}`);
      return newStudent;
    } catch (error) {
      console.error('❌ Lỗi lưu sinh viên từ Account:', error.message);
      throw error;
    }
  }
  // Chức năng: Xem hồ sơ cá nhân
  async getProfile(id: number): Promise<Student> {
    const student = await this.studentRepo.findById(id);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin học viên.');
    return student;
  }

  // Chức năng: Cập nhật thông tin cá nhân
  async updateProfile(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    const student = await this.getProfile(id);

    // Cập nhật các trường cho phép
    let isProfileChanged = false;
    if (updateDto.fullname && updateDto.fullname !== student.fullname) {
      student.fullname = updateDto.fullname;
      isProfileChanged = true;
    }
    if (updateDto.phone) student.phone = updateDto.phone;
    if (updateDto.avatarUrl) student.avatarUrl = updateDto.avatarUrl;

    const updated = await this.studentRepo.save(student);
    if (!updated) throw new InternalServerErrorException('Cập nhật thất bại.');

    // 🚀 Bắn event sang Account Service nếu có thay đổi thông tin định danh
    if (isProfileChanged) {
      this.rabbitClient.emit('profile_updated', {
        id: updated.id,
        fullname: updated.fullname, // Bổ sung email nếu DTO của bạn cho phép đổi email
        // avatarUrl: updated.avatarUrl // Bỏ comment nếu Account Service lưu cả Avatar
      });
      this.logger.log(`🚀 Đã gửi event profile_updated cho User ID: ${updated.id}`);
    }

    return updated;
  }

  // Chức năng: Xem danh sách học viên (Toàn bộ hoặc theo khóa học)
  async getStudents(courseId?: number): Promise<Student[]> {
    let students: Student[] | null;

    if (courseId) {
      students = await this.studentRepo.findByCourseId(courseId);
    } else {
      students = await this.studentRepo.findAll();
    }

    if (!students || students.length === 0) {
      throw new NotFoundException('Danh sách học viên trống.');
    }
    return students;
  }

  /**
 * Kiểm tra Student tồn tại theo email 
 */
  async findByEmail(email: string): Promise<Student | null> {
    // Tạm thời lấy tất cả students rồi filter (không hiệu quả nếu dữ liệu nhiều, nhưng hiện tại repo không có cách khác)
    const allStudents = await this.studentRepo.findAll();
    if (!allStudents) return null;

    return allStudents.find(s => s.email === email) || null;
  }

  /**
   * Tạo Student từ event UserCreated - Sử dụng hàm create() đã có sẵn trong Repository
   */
  async createStudentFromUser(dto: {
    userId: number;
    email: string;
    fullname?: string;
    phone?: string
  }): Promise<Student> {

    const studentCode = `STU${String(dto.userId).padStart(6, '0')}`;

    return this.studentRepo.create({
      id: dto.userId,
      email: dto.email,
      fullname: dto.fullname || '',           // ← ép về string rỗng nếu null
      phone: dto.phone || '',
      studentCode: studentCode,
      status: StudentStatus.UNENROLLED,
    });
  }

  /**
   * Xử lý khi Admin cấp quyền STUDENT cho một User
   */
  async handleRoleAssigned(data: { id: number; email: string }) {
    const studentId = Number(data.id);
    const existingStudent = await this.studentRepo.findById(studentId);

    if (existingStudent) {
      // Nếu user này trước đây từng là sinh viên (bị khóa, giờ mở lại)
      await this.studentRepo.updateStatus(studentId, 'ACTIVE');
      this.logger.log(`✅ [Student] Kích hoạt lại hồ sơ Học viên ID: ${studentId}`);
    } else {
      // Tạo mới hồ sơ học viên
      const generatedCode = `STU-${studentId.toString().padStart(4, '0')}`;
      const defaultName = data.email.split('@')[0];

      await this.studentRepo.create({
        id: studentId,
        email: data.email,
        fullname: defaultName,
        studentCode: generatedCode,
        status: StudentStatus.UNENROLLED,
      });
      this.logger.log(`✅ [Student] Tạo mới hồ sơ Học viên ID: ${studentId}`);
    }
  }

  /**
   * Vô hiệu hóa hồ sơ khi bị tước quyền
   */
  async deactivateStudent(studentId: number) {
    const existing = await this.studentRepo.findById(studentId);
    if (existing) {
      await this.studentRepo.updateStatus(studentId, 'INACTIVE');
      this.logger.log(`🚫 [Student] Vô hiệu hóa hồ sơ Học viên ID: ${studentId}`);
    }
  }

  async findById(userId: number) {
    return await this.studentRepo.findById(userId);
  }

  async hardDelete(userId: number) {
    const result = await this.studentRepo.delete(userId);
    if (result.affected && result.affected > 0) {
      return { message: `Deleted student with id ${userId}` };
    } else {
      throw new NotFoundException(`Student with id ${userId} not found`);
    }
  }

  /**
   * chức năng tương tự createStudentFromUser nhưng khác ở chỗ
   * không cần fullname, phone, status, studentCode vì có thể những
   * trường này ta không biết trước. sử dung khi muốn đồng bộ dữ liệu ở 2 service
   */
  async createInitialProfile(userId: number, email: string) {
    return this.studentRepo.create({
      id: userId,
      email: email,
    });
  }
}