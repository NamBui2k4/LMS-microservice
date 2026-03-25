import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus, 
  ParseUUIDPipe 
} from "@nestjs/common"; // <-- Gom tất cả vào đây
import { LecturerResponseDto, UpdateExpertiseDto } from "./lecturer.do";
import { LecturerService } from "./lecturer.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator"; // Dùng decorator mình đã viết
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UserRole } from "src/academic/user-role.enum";

@Controller('api/v1/lecturers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Put('expertise')
  @Roles(UserRole.LECTURER)
  @HttpCode(HttpStatus.OK)
  async updateExpertise(
    @CurrentUser('id') id: number,
    @Body() dto: UpdateExpertiseDto
  ): Promise<LecturerResponseDto> {
    const updated = await this.lecturerService.updateExpertise(id, dto);
    return LecturerResponseDto.fromEntity(updated);
  }

  @Get(':id/stats')
  @Roles(UserRole.DEPT_HEAD, UserRole.LECTURER)
  @HttpCode(HttpStatus.OK)
  async getStats(@Param('id', ParseUUIDPipe) id: number): Promise<any> {
    return await this.lecturerService.getTeachingStats(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEPT_HEAD)
  @HttpCode(HttpStatus.OK)
  async getAllLecturers(): Promise<LecturerResponseDto[]> {
    const lecturers = await this.lecturerService.findAll();
    return lecturers.map(l => LecturerResponseDto.fromEntity(l));
  }
}