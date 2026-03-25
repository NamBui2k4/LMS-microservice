import { IsString, IsOptional, IsPhoneNumber, IsUrl, IsNotEmpty } from 'class-validator';
import { Student } from './student.entity';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  fullname?: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}

export class StudentResponseDto {
  id: number;
  fullname: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  studentCode: string;
  status: string;

  static fromEntity(entity: Student): StudentResponseDto {
    const dto = new StudentResponseDto();
    dto.id = entity.id;
    dto.fullname = entity.fullname;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.avatarUrl = entity.avatarUrl;
    dto.studentCode = entity.studentCode;
    dto.status = entity.status;
    return dto;
  }
}