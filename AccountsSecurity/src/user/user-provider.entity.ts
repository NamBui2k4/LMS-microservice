import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_providers')
export class UserProvider {
  @PrimaryGeneratedColumn('increment')
  id: number; // Trong hình là int

  // Khóa ngoại liên kết với bảng users (Quan hệ N-1)
  @ManyToOne(() => User, (user) => user.providers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'provider_name', type: 'varchar', length: 100 }) // vd: 'google', 'facebook'
  providerName: string;

  // Sử dụng varchar thay vì int như trong hình để tránh lỗi tràn số với các ID định dạng chuỗi dài
  @Column({ name: 'provider_user_id', type: 'varchar', length: 255 })
  providerUserId: string;

  @Column({ name: 'access_token', type: 'varchar', length: 200, nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 200, nullable: true })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}