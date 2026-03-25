import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Thêm logic tùy chỉnh ở đây nếu cần trước khi gọi super
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Nếu token không hợp lệ hoặc không có token
    if (err || !user) {
      throw err || new UnauthorizedException('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.');
    }
    return user;
  }
}