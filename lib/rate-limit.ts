// Simple in-memory rate limiter replacing Upstash Redis
const map = new Map<string, number[]>();

export const rateLimit = {
  async limit(key: string) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const max = 5;

    let timestamps = map.get(key) || [];
    // Filter out expired timestamps
    timestamps = timestamps.filter((t) => now - t < windowMs);
    
    if (timestamps.length >= max) {
      return { success: false };
    }
    
    timestamps.push(now);
    map.set(key, timestamps);
    return { success: true };
  }
};