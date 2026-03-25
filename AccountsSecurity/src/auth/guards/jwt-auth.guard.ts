import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Bạn có thể thêm logic custom ở đây trước khi gọi logic chuẩn của Passport
    return super.canActivate(context);
  }

  // Ghi đè hàm xử lý kết quả để trả về lỗi thân thiện hơn
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
    }
    // Trả về thông tin user (sau đó NestJS sẽ tự động gán vào req.user)
    return user; 
  }
}