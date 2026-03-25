import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { AuditAction } from './audit-log.enum';
import { User } from 'src/user/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // ================== SỬA PHẦN NÀY ==================
  @Column({ type: 'uuid', nullable: true })
  userId: string;                    // ← giữ string nếu bạn muốn lưu UUID

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  actor: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'target_user_id' })
  target: User;
}