/**
 * Logger Utility
 * Development/production aware logging
 */

import { isDevelopment } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: string;
    data?: unknown;
    timestamp: string;
}

const LOG_COLORS = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
} as const;

function formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const levelStr = entry.level.toUpperCase().padEnd(5);
    return `${entry.timestamp} ${levelStr} ${contextStr} ${entry.message}`;
}

function shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!isDevelopment()) {
        return level === 'warn' || level === 'error';
    }
    return true;
}

function createLogEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
    return {
        level,
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
    };
}

function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, message, context, data);
    const formattedMessage = formatLog(entry);
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.reset;

    switch (level) {
        case 'debug':
        case 'info':
            console.log(`${color}${formattedMessage}${reset}`, data !== undefined ? data : '');
            break;
        case 'warn':
            console.warn(`${color}${formattedMessage}${reset}`, data !== undefined ? data : '');
            break;
        case 'error':
            console.error(`${color}${formattedMessage}${reset}`, data !== undefined ? data : '');
            break;
    }
}

/**
 * Logger object with methods for each log level
 * Usage: logger.info('Message', 'Context', { optional: 'data' })
 */
export const logger = {
    debug: (message: string, context?: string, data?: unknown) => log('debug', message, context, data),
    info: (message: string, context?: string, data?: unknown) => log('info', message, context, data),
    warn: (message: string, context?: string, data?: unknown) => log('warn', message, context, data),
    error: (message: string, context?: string, data?: unknown) => log('error', message, context, data),
};

export default logger;
