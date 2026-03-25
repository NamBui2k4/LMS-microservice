import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { TokenRequestDto } from './refresh-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  /**
   * LÀM MỚI ACCESS TOKEN
   * POST /api/v1/auth/refresh
   * @Body TokenRequestDto
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Body() dto: TokenRequestDto) {
    // 1. Kiểm tra tính hợp lệ của Refresh Token
    const validTokenRecord = await this.refreshTokenService.validateToken(dto.refreshToken);
    
    // 2. Ghi chú: Ở dự án thực tế, sau bước này bạn sẽ gọi AuthService 
    // để tạo ra 1 JWT (Access Token) mới từ `validTokenRecord.user` rồi trả về cho Client.
    // Tạm thời trả về thông báo hợp lệ:
    
    return {
      message: 'Token hợp lệ. Đã cấp phát Access Token mới.',
      // accessToken: 'jwt_moi_o_day',
      user: {
        id: validTokenRecord.user.id,
        email: validTokenRecord.user.email,
        role: validTokenRecord.user.role
      }
    };
  }

  /**
   * ĐĂNG XUẤT (Thu hồi 1 phiên làm việc)
   * POST /api/v1/auth/logout
   * @Body TokenRequestDto
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: TokenRequestDto) {
    await this.refreshTokenService.revokeToken(dto.refreshToken);
    return {
      message: 'Đăng xuất thành công. Phiên làm việc đã bị hủy.',
    };
  }

  /**
   * ĐĂNG XUẤT KHỎI TẤT CẢ THIẾT BỊ (Đòi hỏi phải đăng nhập mới thực hiện được)
   * POST /api/v1/auth/logout-all
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(@Request() req: any) {
    // req.user được gắn từ JwtAuthGuard
    await this.refreshTokenService.revokeAllTokens(req.user.id);
    return {
      message: 'Đã đăng xuất khỏi tất cả các thiết bị.',
    };
  }
}