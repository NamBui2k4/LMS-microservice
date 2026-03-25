import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. KÍCH HOẠT CORS (Cross-Origin Resource Sharing)
  // Cho phép Frontend (React/Vue/Mobile) ở các domain khác gọi được API này
 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: 'account_queue', // 👈 Nhớ cấu hình ĐÚNG tên queue này
      queueOptions: {
        durable: false,
      },
    },
  });
  // 2. KÍCH HOẠT GLOBAL VALIDATION PIPE
  // Tự động kiểm tra dữ liệu đầu vào dựa trên các DTO đã định nghĩa
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // T ự động loại bỏ các trường (fields) gửi lên mà không được khai báo trong DTO (Chống hack truyền thêm tham số rác)
      forbidNonWhitelisted: true, // Nếu gửi dư trường không có trong DTO -> Trả về lỗi 400 Bad Request luôn
      transform: true, // Tự động ép kiểu dữ liệu (vd: param trên URL là string '1' sẽ tự ép sang number 1 nếu DTO định nghĩa là number)
      exceptionFactory: (errors) => {
        // In ra console để debug ngay
        console.log('=== VALIDATION ERRORS ===', JSON.stringify(errors, null, 2));

        return new BadRequestException({
          statusCode: 400,
          message: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
          })),
          error: 'Bad Request',
        });
      },
      // Tùy chỉnh format lỗi trả về cho Frontend dễ đọc hơn (Tùy chọn)
      // disableErrorMessages: false, // Để true ở Production nếu không muốn lộ chi tiết lỗi
    }),
  );

  // 3. KHỞI CHẠY SERVER
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 Accounts & Security Microservice is running on: http://localhost:${port}`);
}

bootstrap();