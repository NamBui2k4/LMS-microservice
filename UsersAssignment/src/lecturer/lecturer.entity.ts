import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { AssignedLecturer } from 'src/assign-lecturer/assign-lecturer.entity';

@Entity('lecturers')
export class Lecturer {
  @PrimaryColumn({ type: 'int' })
  id: number; // Đồng bộ với User ID từ module Account & Security

  @Column({ length: 150 })
  fullname: string;

  @Index()
  @Column({ length: 255 })
  email: string;

  @Column({ unique: true, length: 50 })
  lecturerCode: string; // Mã giảng viên (VD: GV001)

  
  @Column({ nullable: true })
  degree: string; // Học vị (Thạc sĩ, Tiến sĩ...)

  @Column({ length: 100 })
  department: string; // Khoa/Bộ môn

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => AssignedLecturer, (assignment) => assignment.lecturer)
  assignments: AssignedLecturer[];

  @Column({ type: 'text', nullable: true })
  specialization: string; // Chuyên môn sâu
    
  @Column({ type: 'text', nullable: true })
  bio: string; // Giới thiệu bản thân

  // THÊM CỘT NÀY VÀO ĐÂY
  @Column({ default: 'ACTIVE' })
  status: string;
}