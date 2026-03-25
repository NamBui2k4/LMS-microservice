import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/user.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector giúp đọc metadata do Decorator gắn vào
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Nếu Route không yêu cầu quyền cụ thể nào (không có @Roles) -> Cho phép đi qua
    if (!requiredRoles) {
      return true;
    }

    // Lấy thông tin user từ request (đã được JwtAuthGuard gán vào)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin xác thực của người dùng.');
    }

    // Kiểm tra xem role của user có nằm trong danh sách các role được phép không
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có đủ quyền hạn để thực hiện hành động này.');
    }

    return true;
  }
}