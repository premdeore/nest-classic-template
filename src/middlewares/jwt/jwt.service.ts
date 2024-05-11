import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { UserDocument } from 'src/mongodb/schema';

@Injectable()
export class JwtService {
  private readonly JWT_SECRET: string;
  private readonly EXPIRE_TIME: string;

  constructor(protected config: ConfigService) {
    this.JWT_SECRET = this.config.get('JWT_SECRET');
    this.EXPIRE_TIME = this.config.get('EXPIRE_TIME');
  }

  produceToken(user: UserDocument) {
    return sign({ userId: user.id }, this.JWT_SECRET, {
      expiresIn: this.EXPIRE_TIME,
    });
  }
}
