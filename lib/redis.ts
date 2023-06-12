import Redis, { RedisOptions } from "ioredis";


function createClient(): Redis {
    const options: RedisOptions = {
        host: process.env.REDIS_HOST,
        port: Number.parseInt(process.env.REDIS_PORT as string),
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        showFriendlyErrorStack: process.env.NODE_ENV !== "production",
        enableAutoPipelining: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
            if (times > 3) {
                throw new Error(`[Redis] Failed to connect after ${times} attempts.`);
            }
            return Math.min(times * 200, 1000);
        },
    };

    return new Redis(options)
}

export const redis = createClient();

export async function getCounts(projectSlugs: string[]): Promise<Record<string, number>> {
	let views: Record<string, number> = {} as Record<string, number>;
	let redisResponse = await redis.mget(projectSlugs.map(p => `pageviews:projects:${p}`));

	redisResponse
	.forEach((item, index) => {
		views[projectSlugs[index]] = (item && Number.parseInt(item)) || 0;
	})
    return views
}


export async function getCount(projectSlug: string): Promise<number> {
    const maybeCount = await redis.get(`pageviews:projects:${projectSlug}`);
    return maybeCount ? Number.parseInt(maybeCount) : 0;
}


export async function tryIncrementView(slug: string, dedup_on_ip?: string): Promise<number> {

	if (dedup_on_ip) {
		// Hash the IP in order to not store it directly in the db.
		const buf = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(dedup_on_ip),
		);
		const hash = Array.from(new Uint8Array(buf))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

        const wasKeySet = await redis.set(
            `deduplicate:${hash}:${slug}`, 
            "1",
            "EX",
            24 * 60 * 60,
            "NX"
        );

        if (!!wasKeySet) {
            return Number.parseInt(await redis.get(`pageviews:projects:${slug}`) as string);
        }
    }
    return await redis.incr(`pageviews:projects:${slug}`);
}

export default redis;