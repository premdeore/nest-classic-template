import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { writeFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let msg: string = 'Interval Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      msg = exception.message;
    }
    const { httpAdapter } = this.httpAdapterHost;

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      isError: true,
      message: msg,
    };

    await this.writeHttpLog(body);

    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  private async writeHttpLog(data: Record<string, any>) {
    const currentDate = this.getCurrentDate();
    const LOGS_DIR = join(__dirname, 'logs');
    const logFileName = `${currentDate}.txt`;
    const logFilePath = join(LOGS_DIR, logFileName);

    // Check if log directory exists, if not, create it
    if (!existsSync(LOGS_DIR)) {
      try {
        mkdirSync(LOGS_DIR);
      } catch (error) {
        console.error('Error creating log directory:', error);
        return;
      }
    }

    try {
      // Format log data
      const logEntry = `[${data.timestamp}] [${data.statusCode}] ${data.message}\n`;

      // Write log data to log file, append if file already exists
      writeFile(
        logFilePath,
        JSON.stringify(data) + '\n',
        { flag: 'a' },
        (err) => {
          if (err) {
            console.error('Error writing to log file:', err);
          }
        },
      );
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private getCurrentDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
