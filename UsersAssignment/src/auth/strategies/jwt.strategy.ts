import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';

// src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Nên dùng ConfigService
    });
  }

  async validate(payload: any) {
    // Payload này là dữ liệu giải mã từ Token
    // Trả về object này sẽ được gán vào request.user
    if (!payload) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}