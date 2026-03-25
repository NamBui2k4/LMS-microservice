import { Controller, UseGuards, Get, HttpCode, HttpStatus, Patch, Body, Query } from "@nestjs/common";
import { StudentResponseDto, UpdateStudentDto } from "./student.dto";
import { StudentService } from "./student.service";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/academic/user-role.enum";
import { EventPattern, Payload } from "@nestjs/microservices";



@Controller('api/v1/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  /**
   * XEM HỒ SƠ CÁ NHÂN (Học viên tự xem)
   * GET /api/v1/students/profile
   */
  @Get('profile')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser('id') id: number): Promise<StudentResponseDto> {
    const student = await this.studentService.getProfile(id);
    return StudentResponseDto.fromEntity(student);
  }

  /**
   * CẬP NHẬT THÔNG TIN CÁ NHÂN
   // PATCH http://localhost:3000/api/v1/students/profile
    {
      "fullname": "Nguyen Van A",
      "phone": "0987654321",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
   */
  @Patch('profile')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser('id') id: number,
    @Body() updateDto: UpdateStudentDto
  ): Promise<StudentResponseDto> {
    const updated = await this.studentService.updateProfile(id, updateDto);
    return StudentResponseDto.fromEntity(updated);
  }

  /**
   * XEM DANH SÁCH HỌC VIÊN (Giảng viên, Trưởng bộ môn)
   * GET /api/v1/students?courseId=...
   */
  @Get()
  @Roles(UserRole.LECTURER, UserRole.DEPT_HEAD)
  @HttpCode(HttpStatus.OK)
  async getStudents(@Query('courseId') courseId?: number): Promise<StudentResponseDto[]> {
    const students = await this.studentService.getStudents(courseId);
    return students.map(s => StudentResponseDto.fromEntity(s));
  }

}