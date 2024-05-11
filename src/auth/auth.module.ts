import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from 'src/middlewares/jwt/jwt.module';

@Module({
  imports:[JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
