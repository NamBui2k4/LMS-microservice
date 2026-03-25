// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentController } from './student.controller';
import { AppMessageController } from '../app.message.controller';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';
import { LecturerModule } from 'src/lecturer/lecturer.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]), 
    LecturerModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'], // Đảm bảo URL giống với bên account
          queue: 'account_queue', // 👈 Tên queue để gửi tin nhắn SANG Account Service
          queueOptions: {
            durable: false, // Hoặc true tùy cấu hình ban đầu của bạn
          },
        },
      },
    ]),
  ],
  
  controllers: [
    StudentController,        // API HTTP
    AppMessageController, // RabbitMQ Listener (PHẢI CÓ Ở ĐÂY)
  ],
  providers: [
    StudentService,
    StudentRepository,
  ],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}