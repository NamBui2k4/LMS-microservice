// main.ts
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- PHẦN THIẾU QUAN TRỌNG NHẤT ---
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: 'user_created_queue', // Tên queue phải khớp với Account Service
      queueOptions: {
        durable: false,
        autoDelete: false,
      },
      noAck: false
    },
  });

  // Kích hoạt lắng nghe các Microservices đã kết nối
  await app.startAllMicroservices();
  // ---------------------------------

  // 1. KÍCH HOẠT CORS (Cross-Origin Resource Sharing)
  // Cho phép Frontend (React/Vue/Mobile) ở các domain khác gọi được API này
  app.enableCors({
    origin: '*', // Trong thực tế (Production), bạn nên thay bằng domain cụ thể của Frontend (vd: 'https://admin.domain.com')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. KÍCH HOẠT GLOBAL VALIDATION PIPE
  // Tự động kiểm tra dữ liệu đầu vào dựa trên các DTO đã định nghĩa
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('=== VALIDATION ERRORS ===', JSON.stringify(errors, null, 2));   // ← Dòng này phải có
        return new BadRequestException({
          statusCode: 400,
          message: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
          })),
          error: 'Bad Request',
        });
      },
    })
  );

  // 3. KHỞI CHẠY SERVER
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Accounts & Security Microservice is running on: http://localhost:${port}`);
}
bootstrap();