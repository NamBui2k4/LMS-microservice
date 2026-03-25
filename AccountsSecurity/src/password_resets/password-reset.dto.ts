import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token xác thực không được để trống.' })
  token: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống.' })
  @MinLength(8, { message: 'Mật khẩu phải ít nhất 8 ký tự.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số/ký tự đặc biệt.',
  })
  newPassword: string;
}