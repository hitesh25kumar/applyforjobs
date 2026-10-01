import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.message
                : 'Internal server error';

        const errorResponse = exception instanceof HttpException
            ? exception.getResponse()
            : { message: 'Internal server error' };

        // Generate error tracking ID
        const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Log error with context
        this.logger.error(
            `[${errorId}] ${request.method} ${request.url} - Status: ${status}`,
            exception instanceof Error ? exception.stack : undefined,
            {
                errorId,
                method: request.method,
                url: request.url,
                status,
                message,
                body: request.body,
                user: (request as any).user?.uid,
            }
        );

        // Send error response
        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            errorId,
            message: typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message || message,
            ...(process.env.NODE_ENV === 'development' && {
                error: errorResponse,
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        });
    }
}
