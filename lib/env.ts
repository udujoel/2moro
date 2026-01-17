/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GEMINI_KEY',
] as const;

const optionalEnvVars = [
    'ELEVENLABS_API_KEY',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_REDIRECT_URI_LOCALHOST',
] as const;

type RequiredEnvVar = typeof requiredEnvVars[number];
type OptionalEnvVar = typeof optionalEnvVars[number];

interface EnvValidationResult {
    valid: boolean;
    missing: string[];
}

/**
 * Validate that all required environment variables are set
 * Call this at app startup to fail fast if configuration is incomplete
 */
export function validateEnv(): EnvValidationResult {
    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error(
            `❌ Missing required environment variables:\n${missing.map(v => `   - ${v}`).join('\n')}\n` +
            `\nPlease add these to your .env.local file. See .env.example for reference.`
        );
    }

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Get a required environment variable, throwing if not set
 */
export function getRequiredEnv(key: RequiredEnvVar): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(key: OptionalEnvVar, defaultValue: string = ''): string {
    return process.env[key] ?? defaultValue;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}
