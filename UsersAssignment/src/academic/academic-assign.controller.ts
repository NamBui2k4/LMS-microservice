import { Controller, UseGuards, Post, HttpCode, HttpStatus, Body, Delete, Param, ParseUUIDPipe } from "@nestjs/common";
import { AcademicAssignmentService } from "./academic-assign.service";
import { AssignLecturerDto } from "../assign-lecturer/assign.dto";
import { EnrollmentResponseDto, EnrollStudentDto } from "../enrollment/enrollment.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "./user-role.enum";
import { AssignedLecturerResponseDto } from "./academic.dto";

@Controller('api/v1/academic')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicAssignmentController {
  constructor(private readonly assignmentService: AcademicAssignmentService) {}

  /**
   * THÊM HỌC VIÊN VÀO KHÓA HỌC
   * POST /api/v1/academic/enroll
   */
  @Post('enroll')
  @Roles(UserRole.LECTURER, UserRole.DEPT_HEAD)
  @HttpCode(HttpStatus.CREATED)
  async enrollStudent(@Body() dto: EnrollStudentDto): Promise<EnrollmentResponseDto> {
    const enrollment = await this.assignmentService.enrollStudent(dto);
    return EnrollmentResponseDto.fromEntity(enrollment);
  }

  /**
   * XÓA HỌC VIÊN KHỎI KHÓA HỌC
   * DELETE /api/v1/academic/unenroll/:studentId/:courseId
   */
  @Delete('unenroll/:studentId/:courseId')
  @Roles(UserRole.LECTURER, UserRole.DEPT_HEAD)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenroll(
    @Param('studentId', ParseUUIDPipe) studentId: number,
    @Param('courseId', ParseUUIDPipe) courseId: number
  ): Promise<void> {
    await this.assignmentService.unenrollStudent(studentId, courseId);
  }

  /**
   * PHÂN CÔNG GIẢNG VIÊN VÀO KHÓA HỌC
   * POST /api/v1/academic/assign-lecturer
   */
  @Post('assign-lecturer')
  @Roles(UserRole.DEPT_HEAD)
  @HttpCode(HttpStatus.CREATED)
  async assignLecturer(@Body() dto: AssignLecturerDto): Promise<AssignedLecturerResponseDto> {
    const assignment = await this.assignmentService.assignLecturer(dto);
    return AssignedLecturerResponseDto.fromEntity(assignment);
  }
}