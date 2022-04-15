import winston from "winston";
import { ConsoleTransportInstance, FileTransportInstance } from "winston/lib/winston/transports";

class LoggerService {
    private _logger?: winston.Logger;

    get logger() {
        if (!this._logger) {
            throw new Error('Cannot access logger before connecting');
        }
        return this._logger;
    }
    connect(parameters: { isDevelopment: boolean, url?: string, logDir: string, serviceName: string }) {
        this._logger = winston.createLogger({
            level: 'info',
            defaultMeta: { service: parameters.serviceName },
            format: winston.format.json(),
            transports: this.transports(parameters.isDevelopment, parameters.logDir)
        })
    }
    private transports(isDevelopment: boolean, logDir: string) {
        let transports: ConsoleTransportInstance[] | FileTransportInstance[] = [
            new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
            new winston.transports.File({ filename: `${logDir}/debug.log`, level: 'debug' }),
            new winston.transports.File({ filename: `${logDir}/info.log`, level: 'info' })
        ]
        if (isDevelopment) {
            transports = [new winston.transports.Console({ level: 'debug' })];
        }
        return transports;
    }
    errorLogMiddleware(err: any, req: any, res: any, next: any) {
        loggerService.logger.error({ errors: [{ mesage: err.message }] });
        next(err)
    }
    logMiddleware(req: any, res: any, next: any) {
        loggerService.logger.info({ body: req.body, path: req.originalUrl, host: req.hostname });
        next()
    }
}
export const loggerService = new LoggerService();