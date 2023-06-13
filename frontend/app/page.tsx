import Link from "next/link";
import React from "react";
import Particles from "./components/particles";

const navigation = [
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
			<nav className="my-16 animate-fade-in">
				<ul className="flex items-center justify-center gap-4">
					{navigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="text-lg duration-100 text-zinc-400 hover:text-zinc-200"
						>
							{item.name}
						</Link>
					))}
				</ul>
			</nav>
			<div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<Particles
				className="absolute inset-0 -z-10 animate-fade-in"
				quantity={100}
			/>
			<h1 className="z-10 text-4xl text-transparent duration-200 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
				aalekhpatel07
			</h1>

			<div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<div className="my-16 text-center animate-fade-in">
				<h2 className="text-sm text-zinc-400 ">
					Hi, my name is Aalekh! I'm building tools that reduce the availablity
					of <abbr title="Child Sexual Abuse Material" className="hover:cursor-help">CSAM</abbr> on the internet at the {" "}
					<Link
						target="_blank"
						href="https://protectchildren.ca"
						className="underline duration-100 hover:text-zinc-300"
					>
						Canadian Centre for Child Protection
					</Link>

					<br />
					and contributing to open source software in the night at {" "}
					<Link
						target="_blank"
						href="https://github.com/aalekhpatel07"
						className="underline duration-100 hover:text-zinc-300"
					>
						@aalekhpatel07
					</Link>.
				</h2>
			</div>
		</div>
	);
}
