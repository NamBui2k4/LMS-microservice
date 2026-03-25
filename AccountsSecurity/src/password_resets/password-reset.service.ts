import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PasswordResetRepository } from './password-reset.repository';
import { UserRepository } from '../user/user.repository'; // Import UserRepository từ module User
import { ForgotPasswordDto, ResetPasswordDto } from './password-reset.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly passwordResetRepo: PasswordResetRepository,
    private readonly userRepo: UserRepository, // Tái sử dụng Repo của module khác
  ) {}

  /**
   * 1. YÊU CẦU KHÔI PHỤC MẬT KHẨU
   */
  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    try {
      const user = await this.userRepo.findByEmail(dto.email);
      
      // Vì lý do bảo mật (tránh rò rỉ email có tồn tại hay không), 
      // nếu không tìm thấy user, ta vẫn trả về thành công nhưng không làm gì cả.
      if (!user) return;

      // Tạo token ngẫu nhiên
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set thời gian hết hạn là 15 phút kể từ lúc tạo
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      await this.passwordResetRepo.create({
        user: user,
        resetToken: resetToken,
        expiresAt: expiresAt,
      });

      // TODO: Tích hợp NodeMailer hoặc dịch vụ gửi Email (SendGrid, AWS SES) ở đây
      // console.log(`Gửi email tới ${user.email} với link: http://domain.com/reset?token=${resetToken}`);
      
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi xử lý yêu cầu khôi phục mật khẩu.');
    }
  }

  /**
   * 2. THỰC THI ĐẶT LẠI MẬT KHẨU
   */
  async executePasswordReset(dto: ResetPasswordDto): Promise<void> {
    try {
      const resetRecord = await this.passwordResetRepo.findByToken(dto.token);

      // 1. Kiểm tra token có tồn tại không
      if (!resetRecord) {
        throw new BadRequestException('Token không hợp lệ hoặc không tồn tại.');
      }

      // 2. Kiểm tra token đã được sử dụng chưa
      if (resetRecord.usedAt) {
        throw new BadRequestException('Token này đã được sử dụng.');
      }

      // 3. Kiểm tra token đã hết hạn chưa
      if (new Date() > resetRecord.expiresAt) {
        throw new BadRequestException('Token đã hết hạn. Vui lòng yêu cầu khôi phục lại.');
      }

      // 4. Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

      // 5. Cập nhật mật khẩu cho User
      await this.userRepo.update(resetRecord.user.id, {
        passwordHash: hashedPassword,
      });

      // 6. Đánh dấu token đã được sử dụng
      await this.passwordResetRepo.markAsUsed(resetRecord.id);

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống khi đặt lại mật khẩu.');
    }
  }
}