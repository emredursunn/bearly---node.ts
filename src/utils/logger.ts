import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Create transports for different log levels
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m', // 20MB
  maxFiles: '7d', // Keep logs for 7 days
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [fileTransport, errorTransport, consoleTransport],
  exitOnError: false, // Don't exit on handled exceptions
});

// Create a stream object for Morgan (HTTP request logging)
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Add additional context to logs
export const addContext = (key: string, value: any): void => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    [key]: value,
  };
};

export default logger;
