import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  Logger
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, ChangeRoleDto, RegisterDto, ChangePasswordDto, LoginDto } from './user.dto';
import * as bcrypt from 'bcrypt'; // Giả định bạn dùng bcrypt để hash mật khẩu
import { UserRole, AccountStatus } from './user.enum';
import { UserProviderRepository } from './user-provider.repository';
import { OAuthProfileDto } from './user.dto';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userProviderRepo: UserProviderRepository,
    private readonly jwtService: JwtService,
    @Inject('ACCOUNT_SERVICE') private readonly rabbitClient: ClientProxy,
  ) { }

  /**
   * ĐĂNG KÝ TÀI KHOẢN (Cho Khách)
   */
  async register(dto: RegisterDto): Promise<User | null> {
    // 1. Kiểm tra mật khẩu khớp nhau (Logic SRS: Mật khẩu nhập 2 lần)
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    // 2. Giả định kiểm tra CAPTCHA ở Controller hoặc Interceptor

    // 3. Kiểm tra email tồn tại
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng.');
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const newUser = await this.userRepo.create({
        email: dto.email,
        passwordHash: hashedPassword,
        role: UserRole.STUDENT, // Mặc định khi đăng ký là Học viên
        status: AccountStatus.ACTIVE
      });

      console.log('user mới sau khi đăng ký là:', newUser);
      console.log('user mới này có vai trò là: ', newUser.role)

      if (newUser.role === 'STUDENT') {
        this.rabbitClient.emit('user_created', {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        });
        console.log('🚀 Đã gửi event user_created cho ID:', newUser.id);
      }
      return newUser
    } catch (error) {
      throw new InternalServerErrorException('Lỗi trong quá trình đăng ký.');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;

    // 1. Tìm user theo email (sử dụng repo bạn đã có)
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      console.log('User not found for email:', email);
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 2. Kiểm tra trạng thái tài khoản
    if (user.status === 'LOCKED' || user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc vô hiệu hóa');
    }

    if (user.role !== UserRole.ADMIN && loginDto.role === UserRole.ADMIN) {
      throw new UnauthorizedException('Bạn không có quyền truy cập khu vực quản trị!');
    }

    // 3. So sánh mật khẩu (password thuần vs password_hash trong DB)
    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    console.log('--- DEBUG LOGIN START ---');
    console.log('Received from dto password:', password);
    console.log('User password:', user.passwordHash);
    if (!isPasswordMatching) {
      // Ở đây bạn có thể gọi thêm userRepository.updateLockStatus nếu sai quá nhiều lần
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // 4. Tạo JWT Payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    console.log('--- KIỂM TRA DỮ LIỆU TRƯỚC KHI BCRYPT ---');
    console.log('Giá trị password từ Postman:', loginDto.password);
    console.log('Giá trị passwordHash từ DB:', user?.passwordHash);

    // 🚀 BẮN EVENT KIỂM TRA ĐỒNG BỘ DỮ LIỆU
    this.rabbitClient.emit('user_logged_in', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Trả về Token và thông tin cơ bản
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }
  /**
   * THAY ĐỔI MẬT KHẨU (Cho Người dùng đang đăng nhập)
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<User | null> {
    const user = await this.findOne(userId);

    // 1. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }

    try {
      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);

      return await this.userRepo.update(userId, {
        passwordHash: hashedNewPassword
      });
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi cập nhật mật khẩu.');
    }
  }

  /**
   * Lấy danh sách thông tin cơ bản của tất cả User 
   * (Dùng cho Worker/Cronjob đối soát dữ liệu bên Academic)
   */
  async findAllBasicInfo() {
    this.logger.log('📦 Đang truy xuất danh sách User để đồng bộ dữ liệu...');

    // Dùng thuộc tính 'select' của TypeORM để chỉ lấy những cột cần thiết
    const users = await this.userRepo.find({
      select: ['id', 'email', 'role'],
    });

    return users;
  }
  /**
   * TÌM KIẾM NGƯỜI DÙNG THEO ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
    }
    return user;
  }

  /**
   * TẠO TÀI KHOẢN NGƯỜI DÙNG (Cho Quản trị viên)
   */
  async create(dto: CreateUserDto): Promise<User> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      const newUser = await this.userRepo.create({
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        status: dto.status,
        isActive: true
      });

      // 2. Bắn tin nhắn sang Academic-Service
      if (newUser.role === 'STUDENT') {
        this.rabbitClient.emit('user_created', {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        });
        console.log('🚀 Đã gửi event user_created cho ID:', newUser.id);
      }
      return newUser;
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Email đã tồn tại');
      if (await this.userRepo.findByEmail(dto.email))
        throw new ConflictException('Email này đã được sử dụng trên hệ thống.');
      throw error;
    }

  }

  /**
   * PHÂN QUYỀN NGƯỜI DÙNG (Cho Quản trị viên)
   */
  async changeRole(id: string, dto: ChangeRoleDto): Promise<User> {
    // 1. Lấy thông tin user cũ để biết Role hiện tại là gì
    const oldUser = await this.findOne(id);
    const oldRole = oldUser.role;

    // 2. Cập nhật Role mới vào Database
    const updatedUser = await this.userRepo.update(id, { role: dto.role });
    if (!updatedUser) throw new InternalServerErrorException('Cập nhật quyền thất bại.');

    // 3. 🚀 Phát sự kiện qua RabbitMQ
    // Chỉ gửi khi role thực sự thay đổi để tránh spam message
    if (oldRole !== updatedUser.role) {
      this.rabbitClient.emit('user_role_changed', {
        id: updatedUser.id,
        email: updatedUser.email,
        oldRole: oldRole,
        newRole: updatedUser.role,
      });
      console.log(`🚀 Đã gửi event user_role_changed cho ID: ${updatedUser.id}`);
    }

    return updatedUser;
  }

  /**
   * VÔ HIỆU HÓA TÀI KHOẢN (Cho Quản trị viên)
   */
  async disableAccount(id: string, dto: ChangeRoleDto): Promise<User> {
    await this.findOne(id);

    try {
      const disabledUser = await this.userRepo.update(id, {
        isActive: false,
        status: dto.status // Giả định status chuyển sang INACTIVE/LOCKED
      });
      if (!disabledUser) throw new InternalServerErrorException('Không thể vô hiệu hóa tài khoản.');
      return disabledUser;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi vô hiệu hóa tài khoản.');
    }
  }

  /**
   * TÌM KIẾM & LỌC NGƯỜI DÙNG (Cho Quản trị viên)
   */
  async searchUsers(query: any): Promise<User[]> {
    try {
      // Logic lọc có thể phức tạp hơn tùy vào yêu cầu (email, role, status...)
      const users = await this.userRepo.findAll({
        where: query,
        order: { createdAt: 'DESC' }
      });
      if (!users) return [];
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi truy vấn danh sách người dùng.');
    }
  }

  /**
   * XỬ LÝ ĐĂNG NHẬP OAUTH (Google, Facebook...)
   */
  async handleOAuthLogin(profile: OAuthProfileDto): Promise<User> {
    try {
      // 1. Kiểm tra xem provider này đã được liên kết với user nào chưa
      const existingProvider = await this.userProviderRepo.findByProviderId(
        profile.providerName,
        profile.providerUserId
      );

      // Nếu đã từng đăng nhập bằng provider này, cập nhật token và trả về user
      if (existingProvider) {
        if (profile.accessToken || profile.refreshToken) {
          await this.userProviderRepo.updateTokens(
            existingProvider.id,
            profile.accessToken || '',
            profile.refreshToken || ''
          );
        }
        return existingProvider.user; // Trả về entity User
      }

      // 2. Nếu chưa từng liên kết provider này, kiểm tra xem email đã tồn tại chưa
      let user = await this.userRepo.findByEmail(profile.email);

      // 3. Nếu user chưa tồn tại, tạo mới tài khoản user
      if (!user) {
        user = await this.userRepo.create({
          email: profile.email,
          role: UserRole.STUDENT, // Mặc định là STUDENT hoặc GUEST
          status: AccountStatus.ACTIVE,
          isActive: true,
          // passwordHash để trống vì đăng nhập qua OAuth
        });
      }

      // 4. Liên kết provider mới với user (dù là user cũ hay user mới tạo)
      if (user) {
        await this.userProviderRepo.create({
          user: user,
          providerName: profile.providerName,
          providerUserId: profile.providerUserId,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken
        });
      } else {
        throw new InternalServerErrorException('Không thể khởi tạo dữ liệu người dùng.');
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi xử lý đăng nhập OAuth.');
    }
  }

  /**
   * ĐỒNG BỘ PROFILE TỪ ACADEMIC SERVICE
   */
  async syncProfileFromAcademic(data: { id: string | number; fullname?: string; email?: string }) {
    const userId = String(data.id);
    const user = await this.userRepo.findById(userId); // Hoặc hàm findOne tương đương của bạn

    if (!user) {
      this.logger.warn(`⚠️ Không tìm thấy User ID: ${userId} để đồng bộ profile.`);
      return;
    }

    // Cập nhật các trường nhận được
    const updatePayload: any = {};
    if (data.fullname) updatePayload.fullname = data.fullname;
    if (data.email) updatePayload.email = data.email;

    if (Object.keys(updatePayload).length > 0) {
      await this.userRepo.update(userId, updatePayload);
      this.logger.log(`✅ Đồng bộ thành công Profile cho User ID: ${userId}`);
    }
  }
}