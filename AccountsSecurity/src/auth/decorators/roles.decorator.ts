import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/user.enum'; // Đảm bảo đường dẫn import đúng

export const ROLES_KEY = 'roles';

// Decorator nhận vào một mảng các UserRole hợp lệ
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);