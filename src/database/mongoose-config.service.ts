import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(protected readonly config:ConfigService){}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.config.get<string>('DB_URL'), 
    };
  }
}