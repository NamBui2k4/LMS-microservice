import { 
  Injectable, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshToken } from './refresh-token.entity';
import { User } from '../user/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

  /**
   * TẠO REFRESH TOKEN MỚI (Gọi khi Đăng nhập thành công)
   */
  async generateRefreshToken(user: User): Promise<RefreshToken> {
    try {
      const tokenString = crypto.randomBytes(40).toString('hex');
      
      // Đặt thời hạn là 7 ngày
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const savedToken = await this.refreshTokenRepo.create({
        user: user,
        token: tokenString,
        expiresAt: expiresAt,
        isRevoked: false,
      });

      if (!savedToken) throw new InternalServerErrorException('Không thể lưu refresh token.');
      return savedToken;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi tạo phiên làm việc.');
    }
  }

  /**
   * KIỂM TRA & XÁC THỰC REFRESH TOKEN (Gọi khi cần lấy Access Token mới)
   */
  async validateToken(tokenString: string): Promise<RefreshToken> {
    try {
      const tokenRecord = await this.refreshTokenRepo.findByToken(tokenString);

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token không tồn tại.');
      }

      if (tokenRecord.isRevoked) {
        throw new UnauthorizedException('Phiên làm việc đã bị hủy (Đăng xuất). Vui lòng đăng nhập lại.');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new UnauthorizedException('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }

      return tokenRecord;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống khi xác thực token.');
    }
  }

  /**
   * THU HỒI TOKEN - ĐĂNG XUẤT (Hủy phiên làm việc hiện tại)
   */
  async revokeToken(tokenString: string): Promise<void> {
    try {
      const tokenRecord = await this.refreshTokenRepo.findByToken(tokenString);
      if (tokenRecord) {
        await this.refreshTokenRepo.revoke(tokenRecord.id);
      }
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi đăng xuất.');
    }
  }

  /**
   * THU HỒI TẤT CẢ TOKEN CỦA USER (Đăng xuất khỏi mọi thiết bị)
   */
  async revokeAllTokens(userId: string): Promise<void> {
    try {
      await this.refreshTokenRepo.revokeAllForUser(userId);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi hủy các phiên làm việc.');
    }
  }
}