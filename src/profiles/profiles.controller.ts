import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileWithPreference } from './dto/profile-with-preference.dto';
import { ProfileStatus } from './entities/profile.schema';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const { userId } = req.user;
    return this.profilesService.updateProfile(userId, dto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch('set-location')
  updateMyLocation(@Req() req, @Body() dto: UpdateLocationDto) {
    return this.profilesService.updateLocation(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    const { userId } = req.user;
    return this.profilesService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('set-preferences')
  async setPreferences(@Req() req, @Body() dto: CreatePreferenceDto) {
    const { userId } = req.user;
    return this.profilesService.setPreference(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-preferences')
  async updatePreferences(@Req() req, @Body() dto: UpdatePreferenceDto) {
    const { userId } = req.user;
    return this.profilesService.updatePreference(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-preferences')
  async getMyPreferences(@Req() req) {
    const { userId } = req.user;
    return this.profilesService.getPreference(userId);
  }
  
  @Get(':userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    const profile = await this.profilesService.getProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
