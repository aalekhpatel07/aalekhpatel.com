import Link from "next/link";
import React from "react";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { Article } from "./article";
import { Eye, Star } from "lucide-react";
import { getCounts, getGithubStars } from "@/lib/redis";


export const revalidate = 60;

const featuredSlug = "minimax";
const top2Slug = "text-cleaner";
const top3Slug = "aalekhpatel.com";

export default async function ProjectsPage() {
	const views = await getCounts(allProjects.map(p => p.slug));
	const projectsWithRepositories = 
		allProjects
		.filter(p => p.repository !== undefined)
		.map(p => p.repository) as string[];

	const stars = await getGithubStars(projectsWithRepositories);

	const featured = allProjects.find(
		(project) => project.slug === featuredSlug,
	)!;

	let featuredStars: number | undefined;
	if (featured) {
		featuredStars = stars[featured.repository as string];
	}

	const top2 = allProjects.find((project) => project.slug === top2Slug)!;
	const top3 = allProjects.find((project) => project.slug === top3Slug)!;
	const sorted = allProjects
		.filter((p) => p.published)
		.filter(
			(project) =>
				project.slug !== featured.slug &&
				project.slug !== top2.slug &&
				project.slug !== top3.slug,
		)
		.sort(
			(a, b) =>
				new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
				new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
		);

	return (
		<div className="relative pb-16">
			<Navigation />
			<div className="px-6 pt-16 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
				<div className="max-w-2xl mx-auto lg:mx-0">
					<h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
						Projects
					</h2>
					<p className="mt-4 text-zinc-400">
						Most of these projects have pretty permissive licenses 
						if you'd like to fork/use them.
					</p>
				</div>
				<div className="w-full h-px bg-zinc-800" />

				<div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
					<Card>
						<Link href={`/projects/${featured.slug}`}>
							<article className="relative w-full h-full p-4 md:p-8">
								<div className="flex items-center justify-between gap-2">
									<div className="text-xs text-zinc-100">
										{featured.date ? (
											<time dateTime={new Date(featured.date).toISOString()}>
												{Intl.DateTimeFormat(undefined, {
													dateStyle: "medium",
												}).format(new Date(featured.date))}
											</time>
										) : (
											<span>SOON</span>
										)}
									</div>
									<div className="flex flex-row gap-x-4">
										{(featured && featured.repository && featured.repository in stars) && (
											<span className="text-zinc-300 text-xs flex items-center gap-1">
												<Star className="w-4 h-4" />{" "}
												{Intl.NumberFormat("en-US", { notation: "compact" }).format(stars[featured.repository as string] as number)}
											</span>
										)}
										<span className="flex items-center gap-1 text-xs text-zinc-300">
											<Eye className="w-4 h-4" />{" "}
											{Intl.NumberFormat("en-US", { notation: "compact" }).format(
												views[featured.slug] ?? 0,
											)}
										</span>
									</div>
								</div>

								<h2
									id="featured-post"
									className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display"
								>
									{featured.title}
								</h2>
								<p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
									{featured.description}
								</p>
								<div className="absolute bottom-4 md:bottom-8">
									<p className="hidden text-zinc-200 hover:text-zinc-50 lg:block hover:underline">
										Read more <span aria-hidden="true">&rarr;</span>
									</p>
								</div>
							</article>
						</Link>
					</Card>

					<div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0 ">
						{[top2, top3].map((project) => (
							<Card key={project.slug}>
								<Article project={project} views={views[project.slug] ?? 0} stars={project.repository ? stars[project.repository] : undefined} />
							</Card>
						))}
					</div>
				</div>
				<div className="hidden w-full h-px md:block bg-zinc-800" />

				<div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
					<div className="grid grid-cols-1 gap-4">
						{sorted
							.filter((_, i) => i % 3 === 0)
							.map((project) => (
								<Card key={project.slug}>
									<Article project={project} views={views[project.slug] ?? 0} stars={project.repository ? stars[project.repository] : undefined}/>
								</Card>
							))}
					</div>
					<div className="grid grid-cols-1 gap-4">
						{sorted
							.filter((_, i) => i % 3 === 1)
							.map((project) => (
								<Card key={project.slug}>
									<Article project={project} views={views[project.slug] ?? 0} stars={project.repository ? stars[project.repository] : undefined}/>
								</Card>
							))}
					</div>
					<div className="grid grid-cols-1 gap-4">
						{sorted
							.filter((_, i) => i % 3 === 2)
							.map((project) => (
								<Card key={project.slug}>
									<Article project={project} views={views[project.slug] ?? 0} stars={project.repository ? stars[project.repository] : undefined}/>
								</Card>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
