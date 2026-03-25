import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lecturer } from '../lecturer/lecturer.entity';

@Entity('assigned_lecturers')
export class AssignedLecturer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'lecturer_id' })
  lecturerId: string; // Cho phép khai báo id của lecturer ngay cả khi đã chỉ định quan hệ
  @ManyToOne(() => Lecturer, (lecturer) => lecturer.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lecturer_id' })
  lecturer: Lecturer;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string; // ID của Lớp học hoặc Đồ án cần phân công

  
  @Column({ length: 50 })
  assignmentRole: string; // VD: 'LECTURER', 'SUPERVISOR' (Người hướng dẫn), 'REVIEWER' (Người phản biện)

  @Column({ length: 20 })
  semester: string; // Học kỳ (VD: 2023.1)

  @CreateDateColumn({ type: 'timestamptz' })
  assignedAt: Date;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string; // ID của khóa học bên module Curriculum


}