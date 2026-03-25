import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const requestId = uuidv4();
    const method = request.method;
    const url = request.url;
    const ip = request.ip ?? 'Unknown';
    const time = new Date().toISOString();
    const cause = exception.message;
    const stack = exception.stack?.split('\n').slice(0, 4).join('\n') || 'No stack trace';  // Rút gọn stack (4 lines)

    // Log error (đẹp hơn với table-like, đỏ với ❌)
    console.log(chalk.red(`\n--- ❌ ERROR [ID: ${requestId}] ---`));
    console.log(chalk.red(`| Status   | ${status}`));
    console.log(chalk.red(`| Method   | ${method.padEnd(10)}`));
    console.log(chalk.red(`| URL      | ${url.padEnd(10)}`));
    console.log(chalk.red(`| IP       | ${ip.padEnd(10)}`));
    console.log(chalk.red(`| Time     | ${time.padEnd(10)}`));
    console.log(chalk.red(`| Cause    | ${cause.padEnd(10)}`));
    console.log(chalk.red(`| Location | From stack trace:`));
    console.log(chalk.red(stack));  // Stack rút gọn để trace vị trí (e.g., file/line in controller/service)
    console.log(chalk.red(`--- ❌ ERROR END [ID: ${requestId}] ---\n`));

    // Response về client (giữ nguyên)
    response.status(status).json({
      statusCode: status,
      timestamp: time,
      path: url,
      message: cause,
    });
  }
}