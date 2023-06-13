import { notFound } from "next/navigation";
import { type Project, allProjects } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";
import { getCount, getGithubStarForSingleRepo } from "@/lib/redis";

export const revalidate = 60;

type Props = {
	params: {
		slug: string;
	};
};

export async function generateStaticParams(): Promise<Props["params"][]> {
	return allProjects
		.filter((p) => p.published)
		.map((p) => ({
			slug: p.slug,
		}));
}

export default async function PostPage({ params }: Props) {
	const slug = params?.slug;
	const project = allProjects.find((project) => project.slug === slug);

	if (!project) {
		notFound();
	}

	const views = await getCount(project.slug);
	let stars: number | undefined;
	
	if (project.repository) {
		stars = await getGithubStarForSingleRepo(project.repository, 60 * 60);
	}

	return (
		<div className="bg-zinc-50 min-h-screen">
			<Header project={project} views={views} stars={stars} />
			<ReportView slug={project.slug} />

			<article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
				<Mdx code={project.body.code} />
			</article>
		</div>
	);
}
