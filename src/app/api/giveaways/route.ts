import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { GiveawayStatus } from "app-types/giveaway";
import { authOptions } from "lib/auth";
import {
	createGiveaway,
	getUserGiveaways,
	hasReachedGiveawayLimit
} from "lib/db";

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		const giveaways = await getUserGiveaways(session.user.id);

		return NextResponse.json<ApiResponse>({ success: true, data: giveaways });
	} catch (error) {
		console.error("Error fetching giveaways:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to fetch giveaways" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Check if user has reached their limit
	const reachedLimit = await hasReachedGiveawayLimit(
		session.user.id,
		session.user.subscriptionPlan
	);

	if (reachedLimit) {
		return NextResponse.json<ApiResponse>(
			{
				success: false,
				error: "You have reached the maximum number of giveaways for your plan"
			},
			{ status: 403 }
		);
	}

	try {
		const data = await req.json();

		// Validate required fields
		if (
			!data.title ||
			!data.postUrl ||
			!data.documentUrl ||
			!data.keyword ||
			!data.startTime ||
			!data.endTime
		) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create the giveaway
		const giveaway = await createGiveaway({
			userId: session.user.id,
			title: data.title,
			description: data.description,
			postUrl: data.postUrl,
			documentUrl: data.documentUrl,
			keyword: data.keyword,
			startTime: new Date(data.startTime),
			endTime: new Date(data.endTime),
			status: GiveawayStatus.SCHEDULED
		});

		return NextResponse.json<ApiResponse>({ success: true, data: giveaway });
	} catch (error) {
		console.error("Error creating giveaway:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to create giveaway" },
			{ status: 500 }
		);
	}
}
