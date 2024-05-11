import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModelsModule } from './mongodb/mongodb-models.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from './middlewares/jwt/jwt.module';
import { JwtMiddleware } from './middlewares/jwt/jwt.middleware';
import { AppExceptionFilter } from './exception/app-exception.filter';
import configuration from './config/envs/configuration';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: configuration, cache: true }),
    DatabaseModule,
    MongooseModelsModule,
    AuthModule,
    AdminModule,
    UserModule,
    JwtModule,
  ],
  controllers: [],
  providers: [{ provide: APP_FILTER , useClass:AppExceptionFilter}],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude({ path: 'auth/signup', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
