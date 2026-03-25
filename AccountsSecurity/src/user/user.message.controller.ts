// src/users/user.message.controller.ts (Account Service)
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserMessageController {
  private readonly logger = new Logger(UserMessageController.name);

  constructor(private readonly userService: UserService) { }

  @EventPattern('profile_updated')
  async handleProfileUpdated(@Payload() data: { id: string | number; fullname?: string; email?: string }) {
    this.logger.log(`📥 [Profile Updated] Nhận yêu cầu đồng bộ từ Academic cho User ID: ${data.id}`);

    try {
      await this.userService.syncProfileFromAcademic(data);
    } catch (error) {
      this.logger.error(`❌ Lỗi đồng bộ Profile tại Account Service: ${error.message}`);
    }
  }

  // 🚀 Dùng @MessagePattern thay vì @EventPattern để có thể TRẢ VỀ dữ liệu
  @MessagePattern('get_all_users_for_sync')
  async handleGetAllUsers() {
    // Giả sử hàm này trong Service trả về mảng: [{ id: 47, email: '...', role: 'LECTURER' }, ...]
    const users = await this.userService.findAllBasicInfo();
    return users;
  }
}
