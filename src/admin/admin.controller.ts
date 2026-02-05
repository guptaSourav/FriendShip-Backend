import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';
import { VerificationStatus } from '../users/entities/user.schema';

@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  
  // 1️⃣ Get all users (profiles with pagination)
  @Get('all-users')
  getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    console.log("inside admin")
    return this.adminService.getAllUserProfiles(
      Number(page),
      Number(limit),
    );
  }

  // 2️⃣ Get user profile by userId
  @Get('users/:userId/profile')
  getProfileByUserId(@Param('userId') userId: string) {
    return this.adminService.getProfileByUserId(userId);
  }

  // 3️⃣ Verify / Reject user
  @Patch('users/verify/:userId')
  verifyUser(
    @Param('userId') userId: string,
    @Body('status') status: VerificationStatus,
  ) {
    return this.adminService.verifyUser(userId, status);
  }

  // 4️⃣ Admin analytics dashboard
  @Get('analytics')
  getAnalytics() {
    return this.adminService.getUserAnalytics();
  }

  @Delete('user/delete/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('users/restore/:userId')
  restoreUser(@Param('userId') userId: string) {
    return this.adminService.restoreUser(userId);
  }

  @Get('users/get-deleted')
  getDeletedUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getDeletedUsers(
      Number(page),
      Number(limit),
    );
  }
}
