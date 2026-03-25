import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // Đường dẫn gốc: http://localhost:3000/
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthCheck() {
    return this.appService.getServiceStatus();
  }
}