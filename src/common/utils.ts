// commonJS
import winston from 'winston';

function getLogger() {
    return winston.createLogger({
        transports: [
            new winston.transports.Console(),
            // new winston.transports.File({ filename: 'combined.log' })
        ]
    });
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message;
    }
    try {
        return JSON.stringify(err);
    } catch {
        return String(err);
    }
}

module.exports = {
    getLogger: getLogger,
    getErrorMessage: getErrorMessage
}