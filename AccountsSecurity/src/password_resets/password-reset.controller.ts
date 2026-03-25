import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto, ResetPasswordDto } from './password-reset.dto';

@Controller('api/v1/password-resets')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  /**
   * YÊU CẦU KHÔI PHỤC MẬT KHẨU
   * POST /api/v1/password-resets/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK) // Trả về 200 OK thay vì 201 Created vì ta không trả về data tạo mới
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.passwordResetService.requestPasswordReset(forgotPasswordDto);
    
    // Luôn trả về thông báo thành công chung chung để bảo vệ hệ thống khỏi dò quét email
    return {
      message: 'Nếu email hợp lệ, một liên kết khôi phục mật khẩu đã được gửi đến hộp thư của bạn.',
    };
  }

  /**
   * THỰC THI ĐẶT LẠI MẬT KHẨU
   * POST /api/v1/password-resets/reset
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.passwordResetService.executePasswordReset(resetPasswordDto);
    
    return {
      message: 'Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập lại.',
    };
  }
}