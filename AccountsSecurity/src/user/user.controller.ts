import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Req,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';
import { UserService } from './user.service';
import { 
  CreateUserDto, 
  RegisterDto, 
  ChangePasswordDto, 
  ChangeRoleDto, 
  LoginDto
} from './user.dto';
import { UserRole } from './user.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard';      
import { Roles } from 'src/auth/decorators/roles.decorator';   

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 1. ĐĂNG KÝ TÀI KHOẢN (Public / Guest)
   * POST /api/v1/users/register
   * @Body RegisterDto
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Trả về HTTP 201
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.userService.register(registerDto);
    // Có thể map sang Response DTO để ẩn passwordHash
    return {
      message: 'Đăng ký tài khoản thành công',
      data: newUser,
    };
  }

  /**
   * Description: Đăng nhập với tư cách là người dùng (không phải admin)
   * // POST http://localhost:3001/api/v1/users/login
    {
      "email": "student1@example.com",
      "password": "hashed_student_pw",
      "role": "STUDENT"
    }
   * @async
   * @param {LoginDto} loginDto 
   * @returns {unknown} 
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // UserController đóng vai trò "cửa ngõ", gọi sang AuthService để xử lý JWT
    const result = await this.userService.login(loginDto);
    return {
      message: 'Đăng nhập thành công',
      data: result, // Trả về AccessToken và thông tin User
    };
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    await this.userService.changePassword(id, dto);
    return { message: 'Đổi mật khẩu thành công' };
  }
}

@Controller('api/v1/admin')
export class AdminController{
  constructor(private readonly userService: UserService) {}

    
    /**
     * @async
     * @param {Request} req 
     * @param {LoginDto} loginDto 
     * @returns {unknown} 
     * @description: Đăng nhập với tư cách là admin
     *  ex: // POST http://localhost:3001/api/v1/admin/login
        {
          "email": "admin@example.com",
          "password": "hashed_admin_pw",
          "role":"ADMIN"
        }
     */
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: Request, @Body() loginDto: LoginDto) {
      const newUser = await this.userService.login(loginDto);
      return {
        message: 'Đăng nhập thành công',
        data: newUser,
      };
    }  
/**
   * 1. TẠO TÀI KHOẢN NGƯỜI DÙNG (Chỉ Quản trị viên)
   * POST /api/v1/admin/create
   * @Body CreateUserDto
   */
  @Post("/create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED) // Trả về HTTP 201
  async createUser(@Body() createUserDto: CreateUserDto) {
      const newUser = await this.userService.create(createUserDto);
      return {
      message: 'Tạo tài khoản thành công',
      data: newUser,
    };
  }  

  /**
   * @description: TÌM KIẾM & LỌC NGƯỜI DÙNG (Chỉ Quản trị viên)
   *             GET http://localhost:3001/api/v1/admin/list_users
   */
  @Get('/list_users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK) // Trả về HTTP 200
  async searchUsers(@Query() query: any) {
    const users = await this.userService.searchUsers(query);
    return {
      message: 'Lấy danh sách người dùng thành công',
      data: users,
    };
  }

  /**
   * 4. XEM THÔNG TIN MỘT NGƯỜI DÙNG
   * GET /api/v1/admin/list_users/:id
   * @Param id
   */
  @Get('/list_users/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  /**
   * @description PHÂN QUYỀN NGƯỜI DÙNG (Chỉ Quản trị viên)
   * Lưu ý: trước khi test, phải có token từ api đăng nhập ở trên
   * PATCH http://localhost:3001/api/v1/admin/list_users/45/role
   * @Body      
   *  {
        "role": "STUDENT",
        "status": "ACTIVE"
      }
   */
  @Patch('/list_users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async changeRole(
    @Param('id') id: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    const updatedUser = await this.userService.changeRole(id, changeRoleDto);
    return {
      message: 'Cập nhật quyền thành công',
      data: updatedUser,
    };
  }

  /**
   * 7. VÔ HIỆU HÓA TÀI KHOẢN (Chỉ Quản trị viên)
   * PATCH /api/v1/users/:id/disable
   * @Param id
   * @Body ChangeRoleDto (Sử dụng lại DTO có chứa status theo hàm disableAccount ở Service)
   */
  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async disableAccount(
    @Param('id') id: string,
    @Body() disableDto: ChangeRoleDto,
  ) {
    const disabledUser = await this.userService.disableAccount(id, disableDto);
    return {
      message: 'Vô hiệu hóa tài khoản thành công',
      data: disabledUser,
    };
  }
}