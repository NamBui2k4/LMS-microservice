import { IsUUID, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum AssignmentRole {
  PRIMARY = 'PRIMARY_TEACHER',
  ASSISTANT = 'ASSISTANT_TEACHER',
  REVIEWER = 'REVIEWER'
}

export class AssignLecturerDto {
  @IsUUID()
  @IsNotEmpty()
  lecturerId: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsEnum(AssignmentRole)
  role: AssignmentRole;
}