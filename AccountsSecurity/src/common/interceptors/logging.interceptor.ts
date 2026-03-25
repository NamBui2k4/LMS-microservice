import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const now = Date.now();
    const requestId = uuidv4();
    const method = req.method;
    const url = req.url;
    const ip = req.ip ?? 'Unknown';
    const time = new Date().toISOString();

    // Log start (đẹp hơn với table-like)
    console.log(chalk.blue(`\n--- 🛡️ DEBUG REQUEST START [ID: ${requestId}] ---`));
    console.log(chalk.cyan(`| Method   | ${method.padEnd(10)}`));
    console.log(chalk.cyan(`| URL      | ${url.padEnd(10)}`));
    console.log(chalk.cyan(`| IP       | ${ip.padEnd(10)}`));
    console.log(chalk.cyan(`| Time     | ${time.padEnd(10)}`));

    return next.handle().pipe(
      tap(() => {  // Không log data full nữa
        const responseTime = Date.now() - now;
        const status = res.statusCode;

        if (status >= 200 && status < 300) {
          // 2xx: Ngắn gọn, xanh với ✅
          console.log(chalk.green(`--- ✅ SUCCESS [ID: ${requestId}] ---`));
          console.log(chalk.green(`| Status   | ${status}`));
          console.log(chalk.green(`| Resp Time| ${responseTime}ms`));
        } else {
          // Fallback warn (vàng)
          console.log(chalk.yellow(`--- ⚠️ WARN [ID: ${requestId}] ---`));
          console.log(chalk.yellow(`| Status   | ${status}`));
          console.log(chalk.yellow(`| Resp Time| ${responseTime}ms`));
        }

        console.log(chalk.blue(`--- 🛡️ DEBUG REQUEST END [ID: ${requestId}] ---\n`));
      }),
    );
  }
}