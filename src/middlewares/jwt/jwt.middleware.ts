import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtPayload, VerifyErrors, verify } from 'jsonwebtoken';
import { USER_MODEL, UserDocument } from 'src/mongodb/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly JWT_SECRET: string;
  private readonly EXPIRE_TIME: string;

  constructor(
    @InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>,
    protected readonly config: ConfigService,
  ) {
    this.JWT_SECRET = this.config.get('JWT_SECRET');
    this.EXPIRE_TIME = this.config.get('EXPIRE_TIME');
  }

  verifyToken = (token: string) =>
    new Promise<string | JwtPayload>(async (resolve, reject) => {
      verify(
        token,
        this.JWT_SECRET,
        (error: VerifyErrors, decoded: string | JwtPayload) => {
          if (error) {
            console.log({ token, error });
            reject(error);
          }
          resolve(decoded);
        },
      );
    });

  async use(req: any, res: any, next: () => void) {
    try {
      // const token = req.headers.authorization?.split(' ')[1] || req.cookies;
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjBkNjU5MGIzMmNmNDEzMWFiZmRkMjkiLCJpYXQiOjE3MTIyMTUzMDksImV4cCI6MTcxMjY0NzMwOX0.uTbuSrEgQXVrkzxgcJ9oGt9cnfYvdKuJru9piHd8fm4';
      const verified_token = await this.verifyToken(token);
      const { userId }: string | any = verified_token;

      const user = await this.userModel.findOne({ _id: userId });

      if (user === null) {
        throw new Error('user does not exist');
      }

      req.auth = verified_token;
      req.user = user;

      next();
    } catch (error) {
      return res.status(401).send({ status: 'UNAUTHORIZED' });
    }
  }
}
