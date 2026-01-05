// src/auth/dto/request-otp.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsDateString } from 'class-validator';
import { Gender } from '../../profiles/entities/profile.schema';

export class RequestOtpDto {
  @IsEmail()
  email: string;
}
