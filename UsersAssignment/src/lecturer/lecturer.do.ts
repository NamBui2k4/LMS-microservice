import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { Lecturer } from './lecturer.entity';

// Có thể dùng Enum để chuẩn hóa học vị nếu cần
export enum AcademicDegree {
  BACHELOR = 'Bachelor',
  MASTER = 'Master',
  DOCTOR = 'Doctor',
  PROFESSOR = 'Professor'
}

export class UpdateExpertiseDto {
  @IsEnum(AcademicDegree, { message: 'Học vị không hợp lệ' })
  @IsNotEmpty({ message: 'Học vị không được để trống' })
  degree: AcademicDegree;

  @IsString()
  @IsNotEmpty({ message: 'Chuyên môn không được để trống' })
  @MaxLength(255)
  specialization: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string; // Giới thiệu ngắn về quá trình giảng dạy/nghiên cứu

  @IsString()
  @IsOptional()
  department?: string; // Khoa hoặc bộ môn công tác
}

export class LecturerResponseDto {
  id: number;
  fullname: string;
  email: string;
  lecturerCode: string;
  degree?: string;
  specialization?: string;
  department: string;
  bio?: string;

  static fromEntity(entity: Lecturer): LecturerResponseDto {
    const dto = new LecturerResponseDto();
    dto.id = entity.id;
    dto.fullname = entity.fullname;
    dto.email = entity.email;
    dto.lecturerCode = entity.lecturerCode;
    dto.degree = entity.degree;
    dto.specialization = entity.specialization;
    dto.department = entity.department;
    dto.bio = entity.bio;
    return dto;
  }
}