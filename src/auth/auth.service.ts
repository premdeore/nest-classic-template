import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_MODEL, UserDocument } from 'src/mongodb/schema/user.schema';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { hash } from 'bcrypt';
import { JwtService } from 'src/middlewares/jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>,
    protected jwt: JwtService,
  ) {}
  async signup(createAuthDto: SignUpDto) {
    const { email, password, username } = createAuthDto;
    try {
      if (Object.keys(createAuthDto).length === 0) {
        throw new HttpException('Need to feed data', HttpStatus.BAD_GATEWAY);
      }
      const validateUser = await this.getUser(email);

      const hashedPassword = await hash(password, 16);
      createAuthDto.password = hashedPassword;

      if (validateUser) {
        throw new HttpException('Already have account', HttpStatus.CONFLICT);
      }
      const user = await this.userModel.create({
        username: username,
        email: email,
        password: hashedPassword,
      });

      return {
        status: true,
        message: 'User Successfully Register',
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'somthing went wrong',
      };
    }
  }

  async signIn(signindata: SignInDto) {
    const { email, password } = signindata;
 
    if (!password && !email) {
      return new HttpException('Complete all fields', HttpStatus.BAD_GATEWAY);
    }

    const user = await this.userModel.findOne({ email });

    const isPassMatched = await user.isValidPassword(password);

    if (!isPassMatched) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!user) {
      return new HttpException('Credential Incorrect', HttpStatus.NOT_FOUND);
    }

    user.password = undefined;

    //create token
    const token = this.jwt.produceToken(user);
    const data = { user, token };

    return {
      status: true,
      data: data,
      message: 'User Signin Successfully',
    };

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: any) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async getUser(email: string) {
    const user = await this.userModel.findOne({
      where: {
        email: email,
      },
    });
    return user;
  }
}
