import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument, AuthProvider } from '../users/entities/user.schema';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

import { MailService } from '../common/mail/mail.service';
import * as bcrypt from 'bcrypt';

import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordRequestDto } from './dto/forget-password.dto';
import { VerifyForgotOtpDto } from './dto/verify-forgetPassword.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { RedisService } from '../redis/redis.service';
import { BadRequestException } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';

import { Gender } from '../profiles/entities/profile.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    private mailService: MailService,
    private redisService: RedisService,
    private profilesService: ProfilesService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async googleLogin(idToken: string, fcmToken?: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload) throw new UnauthorizedException('Invalid Google token');

    const { sub: providerId, email } = payload;

    // 2️⃣ Find or create user
    let user: UserDocument | null = await this.usersService.findByProviderId(
      AuthProvider.GOOGLE,
      providerId,
    );

    // if (user.isBlocked) {
    //   throw new UnauthorizedException('User is blocked');
    // }

    // if (user.isDeleted) {
    //   throw new UnauthorizedException('User not found');
    // }

    if (!user) {
      user = await this.usersService.createUser({
        provider: AuthProvider.GOOGLE,
        providerId,
        email: email!,
        fcmTokens: fcmToken ? [fcmToken] : [],
        // role: 'user',
      });
    } else if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
      // Add new FCM token if provided
      user.fcmTokens.push(fcmToken);
      user.lastLoginAt = new Date();
      await user.save();
    }

    // console.log('Authenticated user:', user);

    // 3️⃣ Return JWT
    return this.generateToken(user);
  }

  generateToken(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Step 1: Request OTP
  async requestOtp(dto: RequestOtpDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in Redis for 5 min
    await this.redisService.set(`otp:register:${dto.email}`, otp, 300);

    // Send OTP email
    // await this.mailService.sendOtp(dto.email, otp);

    return { message: 'OTP sent to email', otp: otp }; // Remove otp in production
  }

  // Step 2: Verify OTP and create user
  async verifyOtp(
    dto: VerifyOtpDto,
    extraData: {
      password: string;
      name: string;
      dateOfBirth: string;
      gender: string;
    },
  ) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const storedOtp = await this.redisService.get(`otp:register:${dto.email}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(extraData.password, 10);

    // Create user
    const user = await this.usersService.createUser({
      provider: AuthProvider.LOCAL,
      providerId: dto.email,
      email: dto.email,
      password: hashedPassword,
      isOtpVerified: true,
      isProfileCompleted: false,
    });

    if (!extraData?.gender) {
      throw new BadRequestException('Gender is required');
    }

    const genderEnum = extraData.gender?.toLowerCase() as Gender;

    if (!Object.values(Gender).includes(genderEnum)) {
      throw new BadRequestException('Invalid gender value');
    }

    // Create profile
    await this.profilesService.createProfile({
      userId: user._id,
      name: extraData.name,
      dateOfBirth: new Date(extraData.dateOfBirth),
      gender: genderEnum,
    });

    // Delete OTP from Redis
    await this.redisService.del(`otp:register:${dto.email}`);

    // Generate JWT
    const token = this.generateToken(user);

    return {
      ...token,
      userId: user._id,
      isProfileCompleted: user.isProfileCompleted,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 🔒 Only LOCAL users can login via email/password
    if (user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Please login using Google');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isOtpVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // 🔐 Password check
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 🔄 Update FCM token
    if (dto.fcmToken && !user.fcmTokens.includes(dto.fcmToken)) {
      user.fcmTokens.push(dto.fcmToken);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);

    return {
      ...token,
      userId: user._id,
      isProfileCompleted: user.isProfileCompleted,
    };
  }

  async requestForgotPasswordOtp(dto: ForgotPasswordRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // console.log('inside function email is', dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        'Password reset not allowed for Google login',
      );
    }

    if (user.isBlocked || user.isDeleted) {
      throw new BadRequestException('User not allowed');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redisService.set(
      `otp:forgot:${dto.email}`,
      otp,
      300, // 5 min
    );

    await this.mailService.sendOtp(dto.email, otp);

    return { message: 'Password reset OTP sent to email' };
  }

  async verifyForgotPasswordOtp(dto: VerifyForgotOtpDto) {
    const storedOtp = await this.redisService.get(`otp:forgot:${dto.email}`);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP verified
    await this.redisService.set(
      `otp:forgot:verified:${dto.email}`,
      'true',
      600, // 10 min to reset password
    );

    // Delete OTP
    await this.redisService.del(`otp:forgot:${dto.email}`);

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const isVerified = await this.redisService.get(
      `otp:forgot:verified:${dto.email}`,
    );

    if (!isVerified) {
      throw new BadRequestException('OTP verification required');
    }

    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // Cleanup
    await this.redisService.del(`otp:forgot:verified:${dto.email}`);

    return { message: 'Password reset successfully' };
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
