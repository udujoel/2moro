/**
 * Rate Limiting Utility
 * In-memory token bucket rate limiter for API protection
 */

interface RateLimitEntry {
    tokens: number;
    lastRefill: number;
}

interface RateLimitConfig {
    maxTokens: number;       // Maximum tokens in bucket
    refillRate: number;      // Tokens to add per second
    windowMs: number;        // Time window in milliseconds
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;           // Unix timestamp when bucket refills
}

// In-memory store for rate limit entries
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default config: 10 requests per 10 seconds
const DEFAULT_CONFIG: RateLimitConfig = {
    maxTokens: 10,
    refillRate: 1,
    windowMs: 10000,
};

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(windowMs: number): void {
    const now = Date.now();
    const expiry = windowMs * 2; // Keep entries for 2x the window

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.lastRefill > expiry) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check rate limit for an identifier (e.g., user ID, IP address)
 * Uses token bucket algorithm
 */
export function checkRateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
): RateLimitResult {
    const { maxTokens, refillRate, windowMs } = { ...DEFAULT_CONFIG, ...config };

    const now = Date.now();
    let entry = rateLimitStore.get(identifier);

    if (!entry) {
        // First request - create new bucket
        entry = {
            tokens: maxTokens - 1, // Consume one token
            lastRefill: now,
        };
        rateLimitStore.set(identifier, entry);

        return {
            success: true,
            remaining: entry.tokens,
            reset: Math.floor((now + windowMs) / 1000),
        };
    }

    // Calculate tokens to add based on time elapsed
    const elapsed = now - entry.lastRefill;
    const tokensToAdd = Math.floor((elapsed / 1000) * refillRate);

    if (tokensToAdd > 0) {
        entry.tokens = Math.min(maxTokens, entry.tokens + tokensToAdd);
        entry.lastRefill = now;
    }

    // Check if request can be allowed
    if (entry.tokens > 0) {
        entry.tokens -= 1;
        rateLimitStore.set(identifier, entry);

        return {
            success: true,
            remaining: entry.tokens,
            reset: Math.floor((now + windowMs) / 1000),
        };
    }

    // Rate limited
    return {
        success: false,
        remaining: 0,
        reset: Math.floor((entry.lastRefill + windowMs) / 1000),
    };
}

/**
 * Create rate limit headers for HTTP response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
        'Retry-After': result.success ? '' : String(Math.max(1, result.reset - Math.floor(Date.now() / 1000))),
    };
}

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
    // AI endpoints - limited
    ai: { maxTokens: 10, refillRate: 1, windowMs: 60000 },     // 10 per minute
    // General API - moderate
    api: { maxTokens: 30, refillRate: 3, windowMs: 60000 },    // 30 per minute
    // Auth endpoints - strict
    auth: { maxTokens: 5, refillRate: 0.5, windowMs: 60000 },  // 5 per minute
} as const;

// Periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cleanupExpiredEntries(DEFAULT_CONFIG.windowMs), 5 * 60 * 1000);
}
