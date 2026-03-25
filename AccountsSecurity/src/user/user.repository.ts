import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindManyOptions } from 'typeorm';
import { User } from './user.entity';
import { UserRole, AccountStatus } from './user.enum';

@Injectable()
export class UserRepository {


  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * TÌM KIẾM NGƯỜI DÙNG THEO ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  /**
   * TÌM KIẾM THEO EMAIL (Phục vụ Login/Check tồn tại)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.createQueryBuilder('user') // Alias là 'user'
      .addSelect('user.password_hash')
      .where('user.email = :email', { email }) // Rất quan trọng
      .getOne();
  }

  /**
   * LẤY DANH SÁCH NGƯỜI DÙNG (Phục vụ tìm kiếm & lọc của Admin)
   */
  async findAll(options?: FindManyOptions<User>): Promise<User[] | null> {
    return this.userRepo.find(options);
  }

  /**
   * TẠO MỚI TÀI KHOẢN
   * Tham số là một Object chứa các field của User, không phải DTO
   */
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepo.create(userData);
    return this.userRepo.save(newUser);
  }

  /**
   * CẬP NHẬT THÔNG TIN TÀI KHOẢN (Thay đổi mật khẩu, role, status...)
   */
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.userRepo.update(id, updateData);
    return this.findById(id);
  }

  /**
   * VÔ HIỆU HÓA HOẶC XÓA TÀI KHOẢN
   */
  async delete(id: string): Promise<void | null> {
    await this.userRepo.delete(id);
    return null;
  }

  /**
   * CẬP NHẬT TRẠNG THÁI KHÓA TÀI KHOẢN (Bảo mật)
   */
  async updateLockStatus(
    id: string,
    failedAttempts: number,
    lockedUntil: Date
  ): Promise<User | null> {
    await this.userRepo.update(id, {
      failedLoginAttempts: failedAttempts,
      lockedUntil: lockedUntil
    });
    return this.findById(id);
  }

  async find(options: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepo.find(options);
  }
}