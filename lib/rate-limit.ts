import { Redis } from "@upstash/redis"
import {Ratelimit} from "@upstash/ratelimit"

const redis = Redis.fromEnv()

export const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    }
)