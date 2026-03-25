// src/academic/dto/response/assigned-lecturer-response.dto.ts
import { AssignedLecturer } from "src/assign-lecturer/assign-lecturer.entity";

export class AssignedLecturerResponseDto {
  id: number;
  lecturerId: string;
  courseId: string;
  targetId?: string;
  assignmentRole: string;
  semester: string;
  assignedAt: Date;

  /**
   * Chuyển đổi từ Entity sang DTO
   */
  static fromEntity(entity: AssignedLecturer): AssignedLecturerResponseDto {
    const dto = new AssignedLecturerResponseDto();
    dto.id = entity.id;
    dto.lecturerId = entity.lecturerId;
    dto.courseId = entity.courseId;
    dto.targetId = entity.targetId;
    dto.assignmentRole = entity.assignmentRole;
    dto.semester = entity.semester;
    dto.assignedAt = entity.assignedAt;
    return dto;
  }
}