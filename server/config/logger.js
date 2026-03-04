import winston from 'winston';
import LokiTransport from 'winston-loki';

const { combine, timestamp, label, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        label({ label: 'whatscloud-api' }),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                myFormat
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Optionally add Loki transport if LOKI_URL is provided
if (process.env.LOKI_URL) {
    logger.add(new LokiTransport({
        host: process.env.LOKI_URL,
        labels: { app: 'whatscloud-api' },
        json: true,
        replaceTimestamp: true,
        onConnectionError: (err) => console.error(err)
    }));
}

export default logger;
