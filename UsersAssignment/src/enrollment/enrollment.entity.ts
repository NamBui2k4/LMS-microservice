import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../student/student.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'student_id' })
  studentId: number

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number; // ID của môn học (từ module Học tập)

  @Column({ default: 'ACTIVE' })
  enrollmentStatus: string; // ACTIVE, COMPLETED, DROPPED

  @CreateDateColumn({ type: 'timestamptz' })
  enrolledAt: Date;
}