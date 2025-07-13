"use client";

import useSWR from "swr";

import { ApiResponse } from "app-types/api";
import { Giveaway } from "app-types/giveaway";
import { SubscriptionPlan } from "app-types/subscription";
import { API } from "constants/api";

import { GiveawayList } from "./giveaway-list";

interface GiveawayListClientProps {
	userSubscriptionPlan?: SubscriptionPlan;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GiveawayListClient({
	userSubscriptionPlan
}: GiveawayListClientProps) {
	const { data, error, isLoading } = useSWR<ApiResponse<Giveaway[]>>(
		API.GIVEAWAYS,
		fetcher
	);

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Loading giveaways...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">Failed to load giveaways</p>
			</div>
		);
	}

	const giveaways = data?.data || [];
	const giveawayCount = giveaways.length;

	return (
		<GiveawayList
			giveaways={giveaways}
			giveawayCount={giveawayCount}
			userSubscriptionPlan={userSubscriptionPlan}
		/>
	);
}
