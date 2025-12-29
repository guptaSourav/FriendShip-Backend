import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env.development', '.env'],
      isGlobal: true, // makes ConfigService available everywhere
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
