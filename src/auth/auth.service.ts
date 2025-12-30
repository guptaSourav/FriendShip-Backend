import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument, AuthProvider } from '../users/entities/user.schema';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
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
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
