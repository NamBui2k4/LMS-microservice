import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany
} from 'typeorm';
import { UserRole, AccountStatus } from './user.enum';
import { UserProvider } from './user-provider.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string; // TypeORM trả về string cho kiểu bigint để tránh tràn số trong JS

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
    passwordHash: string;

    @OneToMany(() => UserProvider, (provider) => provider.user, {
        cascade: true, // Cho phép tự động lưu thông tin provider khi lưu user mới
    })
    providers: UserProvider[];

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.GUEST,
    })
    role: UserRole; // Studen, Lecturer,...


    
    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.PENDING,
    })
    status: AccountStatus;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
    failedLoginAttempts: number;

    @Column({ type: 'timestamptz', nullable: true, name: 'locked_until' })
    lockedUntil: Date;

    @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
    lastLoginAt: Date;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}