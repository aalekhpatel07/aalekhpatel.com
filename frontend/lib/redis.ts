import Redis, { RedisOptions } from "ioredis";


/**
 * Create a Redis client that implements the Redis API.
 * @returns A ready-to-use Redis client.
 */
function createClient(): Redis {
    const options: RedisOptions = {
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

    let path = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    if (process.env.REDIS_USERNAME) {
        path = `rediss://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    }
    return new Redis(path, options)
}

/**
 * The redis client instance to operate on.
 */
export const redis = createClient();

export default redis;


/**
 * Get the page views for multiple projects.
 * @param projectSlugs The projects to fetch the page views for.
 * @returns A map keyed by the projects and their page views as the values.
 */
export async function getCounts(projectSlugs: string[]): Promise<Record<string, number>> {
	let views: Record<string, number> = {} as Record<string, number>;
	let redisResponse = await redis.mget(projectSlugs.map(p => `pageviews:projects:${p}`));

	redisResponse
	.forEach((item, index) => {
		views[projectSlugs[index]] = (item && Number.parseInt(item)) || 0;
	})
    return views
}


/**
 * Get the page views for a single project.
 * @param projectSlug The project to fetch the page views for.
 * @returns The number of page views for this project.
 */
export async function getCount(projectSlug: string): Promise<number> {
    const maybeCount = await redis.get(`pageviews:projects:${projectSlug}`);
    return maybeCount ? Number.parseInt(maybeCount) : 0;
}


/**
 * Try incrementing the page view for the given slug.
 * @param slug The project page that was viewed.
 * @param dedup_on_ip If provided, will deduplicate views on the provided ip address.
 * @returns The updated count of page views for this project.
 */
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


/**
 * Get the Github stars for a given repository.
 * Cache the count for the provided ttl to not overwhelm
 * the Github API.
 * 
 * @param repo The repository to look up.
 * @returns The number of Github stars, if available, else undefined.
 */
export async function getGithubStarForSingleRepo(repo: string, cacheTtl: number): Promise<number | undefined> {
    const cacheKey = `github:stars:${repo}`;
    let cachedValue = await redis.get(cacheKey);
    if (cachedValue) {
        return Number.parseInt(cachedValue);
    }

    let value: number | undefined;

    try {
        const response = (await (await fetch(`https://api.github.com/repos/${repo}`)).json());
        if ("stargazers_count" in response) {
            value = Number.parseInt(response["stargazers_count"]);
        }
    } catch (exc) {
        console.error(`Failed to fetch stargazers count for ${repo} from the Github API.`, exc);
    }

    if (value !== undefined) {
        await redis.setex(cacheKey, cacheTtl, value);
    }
    return value
}

/**
 * Get the Github stars for the collection of repositories concurrently.
 * 
 * @param repositories The list of repositories to fetch the stars for.
 * @param cacheTtl The ttl for the cache of counts obtained from the Github API.
 * @returns An object with the repositories indexed as keys and the counts as values.
 */
export async function getGithubStars(repositories: string[], cacheTtl: number = 60 * 60): Promise<Record<string, number | undefined>> {
    return Object.fromEntries(
        await Promise.all(
            repositories.map(async (repository) => [repository, await getGithubStarForSingleRepo(repository, cacheTtl)])
        )
    )
}