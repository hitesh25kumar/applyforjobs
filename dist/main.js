"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const http_exception_filter_1 = require("./common/http-exception.filter");
const validation_pipe_1 = require("./common/validation.pipe");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigins = process.env.CORS_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) || ['http://localhost:5173', 'http://localhost:5174'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.use('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        });
    });
    const shutdown = async (signal) => {
        logger.log(`Received ${signal}. Gracefully shutting down...`);
        await app.close();
        process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    const port = Number(process.env.PORT) || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on port ${port}`);
    logger.log(`Health check available at /health`);
}
bootstrap();
//# sourceMappingURL=main.js.map