import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    //method that allows you to switch to the HTTP context ,  need to access the request and response objects directly
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const msg = exception.message;

    const body = {
      statuscode: status,
      timestamp: new Date().toISOString(),
      message: msg,
      path: request.url,
    };

    this.writeHttpLog(body);

    response.status(status).json(body);
  }

  private async writeHttpLog(data: Record<string, any>) {
    const LOGS_DIR = join(__dirname, `${Date.now()}-log.json`); // dist/exceptions
    console.log(LOGS_DIR, 'dir');
    try {
      await writeFile(LOGS_DIR, JSON.stringify(data));
    } catch (error) {
      return;
    }
  }
}
