import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceStatus() {
    return {
      service: 'Accounts & Security Microservice',
      status: 'UP',
      uptime: process.uptime(), // Thời gian service đã chạy (tính bằng giây)
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
