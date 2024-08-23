import { ExceptionFilter, Catch, ArgumentsHost, PayloadTooLargeException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class FileSizeLimitExceptionFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'File size should not exceed 5 MB.',
      error: 'Payload Too Large',
    });
  }
}
