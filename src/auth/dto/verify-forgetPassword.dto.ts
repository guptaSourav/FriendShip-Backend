import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyForgotOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}
