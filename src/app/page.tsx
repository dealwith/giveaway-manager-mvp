import Link from "next/link";
import { Button } from "@components/ui/button";
import { ROUTES } from "@constants/routes";
import { TextGenerateEffect } from "@components/ui/text-generate-effect";

export default function HomePage() {
	return (
		<div className="flex-1">
			<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
								Instagram Giveaway Manager
							</h1>
							<TextGenerateEffect words="Automate your Instagram giveaways with ease. Track keywords,
								select winners, and send prizes automatically." />
						</div>
						<div className="space-x-4">
							<Link href={ROUTES.SIGNUP}>
								<Button size="lg">Get Started</Button>
							</Link>
							<Link href={ROUTES.PRICING}>
								<Button variant="outline" size="lg">
									View Pricing
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								How It Works
							</h2>
							<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
								Running a giveaway has never been easier
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
							<div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white dark:bg-gray-950">
								<div className="p-2 bg-primary/10 rounded-full">
									<span className="text-2xl">1</span>
								</div>
								<h3 className="text-xl font-bold">Create a Giveaway</h3>
								<p className="text-gray-500 text-center">
									Set up your giveaway with a keyword and document prize link
								</p>
							</div>
							<div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white dark:bg-gray-950">
								<div className="p-2 bg-primary/10 rounded-full">
									<span className="text-2xl">2</span>
								</div>
								<h3 className="text-xl font-bold">Monitor Comments</h3>
								<p className="text-gray-500 text-center">
									Our system tracks comments with your chosen keyword
								</p>
							</div>
							<div className="flex flex-col items-center space-y-2 border p-6 rounded-lg bg-white dark:bg-gray-950">
								<div className="p-2 bg-primary/10 rounded-full">
									<span className="text-2xl">3</span>
								</div>
								<h3 className="text-xl font-bold">Automate Prizes</h3>
								<p className="text-gray-500 text-center">
									Winners receive direct messages with your prize link
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Ready to Get Started?
							</h2>
							<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
								Join thousands of creators who use our platform for their
								Instagram giveaways
							</p>
						</div>
						<div className="w-full max-w-sm space-y-2">
							<Link href={ROUTES.SIGNUP} className="w-full">
								<Button className="w-full" size="lg">
									Sign Up Now
								</Button>
							</Link>
							<p className="text-xs text-gray-500">
								No credit card required for free tier
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
