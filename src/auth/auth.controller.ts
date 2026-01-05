import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordRequestDto } from './dto/forget-password.dto';
import { VerifyForgotOtpDto } from './dto/verify-forgetPassword.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.idToken, dto.fcmToken);
  }

  // Step 1: Request OTP
  @Post('register/request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  // Step 2: Verify OTP and create user
  @Post('register/verify-otp')
  async verifyOtp(
    @Body()
    dto: VerifyOtpDto & {
      password: string;
      name: string;
      dateOfBirth: string;
      gender: string;
    },
  ) {
    const { otp, email, password, name, dateOfBirth, gender } = dto;

    return this.authService.verifyOtp(
      { email, otp },
      { password, name, dateOfBirth, gender },
    );
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 🔁 Forgot Password Flow
  @Post('forgot-password/request-otp')
  async requestForgotPasswordOtp(@Body() dto: ForgotPasswordRequestDto) {
    return this.authService.requestForgotPasswordOtp(dto);
  }

  @Post('forgot-password/verify-otp')
  async verifyForgotPasswordOtp(@Body() dto: VerifyForgotOtpDto) {
    return this.authService.verifyForgotPasswordOtp(dto);
  }
  
  @Post('forgot-password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
