import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength, Matches, IsBoolean, IsString, IsPhoneNumber, ValidateIf } from 'class-validator';
import { UserRole, AccountStatus } from './user.enum';

/**
 * DTO cho việc Tạo tài khoản (Admin) hoặc Đăng ký (Khách)
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu quá yếu (phải bao gồm chữ hoa, chữ thường và số/ký tự đặc biệt)',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}

/**
 * DTO cho việc Cập nhật thông tin tài khoản chung
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}

/**
 * DTO riêng cho việc Phân quyền (Admin - Change Role)
 */
export class ChangeRoleDto {
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}

/**
 * DTO cho việc Thay đổi mật khẩu
 */
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  oldPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Mật khẩu mới phải ít nhất 8 ký tự' })
  newPassword: string;
}

export class RegisterDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;

  @IsNotEmpty()
  @ValidateIf(o => o.password !== o.confirmPassword) // hoặc dùng custom validator
  confirmPassword: string;

  // === THÊM 2 TRƯỜNG NÀY ===
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()        // hoặc @IsString() nếu không muốn validate phone
  phone?: string;
}

export class OAuthProfileDto {
  providerName: string;
  providerUserId: string;
  email: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
}


export class LoginDto{
  @IsEmail({}, { message: 'Email phải hợp lệ' })  // Validate email format
  email: string;

  @IsString({ message: 'Password phải là string' })
  password: string;

  @IsEnum(UserRole, { message: 'Role phải là giá trị hợp lệ (e.g., ADMIN)' })
  role: UserRole;
}
