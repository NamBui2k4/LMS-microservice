import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Lecturer } from '../lecturer/lecturer.entity';

@Entity('department_heads')
export class DepartmentHead {
  @PrimaryColumn({ type: 'uuid' })
  id: string; // Vẫn dùng chung ID của User/Lecturer

  @OneToOne(() => Lecturer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  lecturer: Lecturer;

  @Column({ length: 100 })
  managedDepartment: string; // Tên bộ môn quản lý

  @Column({ type: 'date', nullable: true })
  appointedDate: Date; // Ngày bổ nhiệm
}