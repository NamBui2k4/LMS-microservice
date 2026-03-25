import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UserController } from './user.controller';
import { UserService } from './user.service';

import { User } from './user.entity';
import { UserProvider } from './user-provider.entity'; // nếu có

import { UserRepository } from './user.repository';          // ← import đúng path
import { UserProviderRepository } from './user-provider.repository';

@Module({
  imports: [
    // Cho phép inject Repository<User> và custom repo
    TypeOrmModule.forFeature([User, UserProvider /* thêm tất cả entity mà UserService dùng */]),

    ClientsModule.register([
      {
        name: 'ACCOUNT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'user_created_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    UserProviderRepository,
  ],
  exports: [
    UserService,
    UserRepository,            // ← THÊM DÒNG NÀY (quan trọng nhất)
    UserProviderRepository,
  ], // nếu sau này có module khác cần dùng
})
export class UserModule { }