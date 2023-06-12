import { tryIncrementView } from "@/lib/redis";
import { NextApiResponse, NextApiRequest } from "next";

export const config = {
	runtime: "nodejs",
};

export default async function (req: NextApiRequest, res: NextApiResponse<number>) {
	if (req.method !== "POST") {
		return res.status(405).end("use POST");
	}
	if (req.headers["content-type"] !== "application/json") {
		return res.status(400).end("must be JSON")
	}

	const body = req.body;
	let slug: string | undefined = undefined;

	if ("slug" in body) {
		slug = body.slug;
	}
	if (!slug) {
		return res.status(400).end("Slug not found");
	}
	let count = await tryIncrementView(slug);
	return res.status(202).json(count);
}
