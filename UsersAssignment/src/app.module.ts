import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Auth & Security
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RolesGuard } from './auth/guards/roles.guard';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { StudentModule } from './student/student.module';
import { AcademicAssignmentModule } from './academic/academic.module';
import { LecturerModule } from './lecturer/lecturer.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ScheduleModule } from '@nestjs/schedule';

// app.module.ts
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),
    StudentModule,
    EnrollmentModule,
    AcademicAssignmentModule, 
    LecturerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Giữ false để an toàn data
      }),
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // Khai báo rõ kiểu trả về là JwtModuleOptions
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        // Dùng || để đảm bảo luôn có một chuỗi string được truyền vào
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: { 
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
  ],
  controllers: [AppController],
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
    JwtStrategy,
    RolesGuard,
  ],
})
export class AppModule { }