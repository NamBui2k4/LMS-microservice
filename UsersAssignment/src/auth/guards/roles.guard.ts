import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy danh sách Roles yêu cầu từ Decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không yêu cầu Role nào, cho phép truy cập
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin user từ request (do JwtAuthGuard gán vào)
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra user có sở hữu ít nhất 1 trong các Role yêu cầu không
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
    }

    return true;
  }
}