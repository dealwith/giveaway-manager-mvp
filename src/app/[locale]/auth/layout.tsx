import { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="container relative flex flex-1 flex-col items-center justify-center py-8">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				{children}
			</div>
		</div>
	);
}
