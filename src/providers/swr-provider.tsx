"use client";
import { ReactNode } from "react";
import { SWRConfig } from "swr";

interface SWRProviderProps {
	children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
	return (
		<SWRConfig
			value={{
				fetcher: (url: string) =>
					fetch(url).then((res) => {
						if (!res.ok) {
							throw new Error("An error occurred while fetching the data.");
						}

						return res.json();
					}),
				revalidateOnFocus: false,
				dedupingInterval: 10000 // 10 seconds
			}}
		>
			{children}
		</SWRConfig>
	);
}
