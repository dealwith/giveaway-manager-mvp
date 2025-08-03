"use client";

import { useEffect, useState } from "react";

interface AnimatedContentProps {
	children: React.ReactNode;
}

export function AnimatedContent({ children }: AnimatedContentProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<div
			className={`text-center transition-all duration-1000 ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
			}`}
		>
			{children}
		</div>
	);
}
