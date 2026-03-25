import { IsNotEmpty, IsString } from 'class-validator';

export class TokenRequestDto {
  @IsNotEmpty({ message: 'Refresh token không được để trống.' })
  @IsString()
  refreshToken: string;
}