import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ==========================================
// 1. IMPORTS ENTITIES
// ==========================================
import { User } from './user/user.entity';
import { UserProvider } from './user/user-provider.entity';
import { PasswordReset } from './password_resets/password-reset.entity';
import { RefreshToken } from './refresh_tokens/refresh-token.entity';
import { AuditLog } from './audit_logs/audit-log.entity';

// ==========================================
// 2. IMPORTS CONTROLLERS
// ==========================================
import { UserController, AdminController } from './user/user.controller';
import { PasswordResetController } from './password_resets/password-reset.controller';
import { RefreshTokenController } from './refresh_tokens/refresh-token.controller';
import { AuditLogController } from './audit_logs/audit-log.controller';

// ==========================================
// 3. IMPORTS SERVICES
// ==========================================
import { UserService } from './user/user.service';
import { PasswordResetService } from './password_resets/password-reset.service';
import { RefreshTokenService } from './refresh_tokens/refresh-token.service';
import { AuditLogService } from './audit_logs/audit-log.service';

// ==========================================
// 4. IMPORTS CUSTOM REPOSITORIES
// ==========================================
import { UserRepository } from './user/user.repository';
// Nếu bạn có tạo file user-provider.repository.ts thì import ở đây:
import { UserProviderRepository } from './user/user-provider.repository';
import { PasswordResetRepository } from './password_resets/password-reset.repository';
import { RefreshTokenRepository } from './refresh_tokens/refresh-token.repository';
import { AuditLogRepository } from './audit_logs/audit-log.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// // Guards, Strategies...
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';


import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // 1. Load cấu hình từ file .env toàn cục
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    // 2. Cấu hình TypeORM chuẩn Microservice (Đọc từ biến môi trường)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'your_password',
        database: configService.get<string>('DB_NAME') || 'accounts_db', // Trỏ đúng vào DB của Account
        entities: [
          User, UserProvider, PasswordReset, RefreshToken, AuditLog
        ],
        synchronize: false, // Luôn để false ở môi trường production/đã có DDL
      }),
    }),

    // 3. Cấu hình JWT an toàn (Đã fix lỗi Strict Type)
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: {
          // Ép kiểu sang `any` (hoặc `unknown as string`) để dập tắt lỗi của TypeScript
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
        },
      }),
    }),

    // Khai báo các Entity để TypeORM khởi tạo các Repository mặc định
    // Điều này cực kỳ quan trọng để các Custom Repository (như UserRepository) có thể Inject được
    TypeOrmModule.forFeature([
      PasswordReset,
      RefreshToken,
      AuditLog
    ]),
  ],
  controllers: [
    AppController,
    AdminController,
    PasswordResetController,
    RefreshTokenController,
    AuditLogController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,  // Global interceptor cho logging
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,  // Global filter cho exceptions
    },
    AppService,
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    // Đăng ký Services
    PasswordResetService,
    RefreshTokenService,
    AuditLogService,

    // Đăng ký Custom Repositories
    PasswordResetRepository,
    RefreshTokenRepository,
    AuditLogRepository,
  ],
})
export class AppModule { }