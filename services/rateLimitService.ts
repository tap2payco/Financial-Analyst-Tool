import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Note: In a production environment, these should be environment variables.
// VITE_UPSTASH_REDIS_REST_URL
// VITE_UPSTASH_REDIS_REST_TOKEN

// Get env vars safely from Vite
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  return '';
};

const redisUrl = getEnvVar('VITE_UPSTASH_REDIS_REST_URL');
const redisToken = getEnvVar('VITE_UPSTASH_REDIS_REST_TOKEN');

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
    const redis = new Redis({
        url: redisUrl,
        token: redisToken,
    });

    // Create a new ratelimiter, that allows 10 requests per 10 seconds
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
    });
}

export const rateLimitService = {
    /**
     * Checks if the request should be ratelimited based on an identifier (e.g., API key or user ID)
     */
    checkRateLimit: async (identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> => {
        if (!ratelimit) {
            // If Upstash is not configured, we allow the request but log a warning.
            // Only log once to avoid console spam in dev
            if (!window.hasLoggedRateLimitWarning) {
                console.warn('Upstash Redis not configured. Rate limiting is disabled.');
                window.hasLoggedRateLimitWarning = true;
            }
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }

        try {
            const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
            return { success, limit, remaining, reset };
        } catch (error) {
            console.error('Rate limit check failed:', error);
            // Fail open (allow request) if rate limiter errors
            return { success: true, limit: 0, remaining: 0, reset: 0 };
        }
    }
};

// Add global type for the warning flag
declare global {
    interface Window {
        hasLoggedRateLimitWarning?: boolean;
    }
}
