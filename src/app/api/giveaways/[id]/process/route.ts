import { NextResponse } from "next/server";

import { ApiResponse } from "app-types/api";
import { createGiveawayWinner, getGiveaway, getGiveawayWinners } from "lib/db";
import { processGiveaway } from "lib/instagram";
import { withInstagramAuth } from "lib/middleware/instagram-auth";
import { RequestWithInstagramCredentials } from "lib/middleware/instagram-auth";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

async function handleProcessGiveaway(
	req: RequestWithInstagramCredentials,
	{ params }: RouteParams
): Promise<NextResponse> {
	try {
		const { id } = await params;
		const giveaway = await getGiveaway(id);

		if (!giveaway) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Giveaway not found" },
				{ status: 404 }
			);
		}

		// Check if the giveaway belongs to the current user
		if (giveaway.userId !== req.userId) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		const existingWinners = await getGiveawayWinners(id);
		const existingUsernames = new Set(existingWinners.map((w) => w.username));

		console.log("Processing giveaway:", {
			postUrl: giveaway.postUrl,
			keyword: giveaway.keyword,
			giveawayId: id,
			existingWinners: existingWinners.length,
			userId: req.userId
		});

		const result = await processGiveaway(
			giveaway.postUrl,
			giveaway.keyword,
			giveaway.documentUrl,
			req.instagramCredentials
		);

		console.log("Process result:", {
			totalComments: result.totalComments,
			winnersFound: result.winners.length,
			winners: result.winners.map((w) => ({
				username: w.username,
				commentId: w.commentId
			}))
		});

		// Save new winners to database (skip existing ones)
		const newWinners = [];
		for (const winner of result.winners) {
			if (!existingUsernames.has(winner.username)) {
				const savedWinner = await createGiveawayWinner({
					giveawayId: id,
					username: winner.username,
					commentId: winner.commentId,
					messageStatus: winner.messageStatus,
					likeStatus: winner.likeStatus
				});
				newWinners.push(savedWinner);
			}
		}

		return NextResponse.json<ApiResponse>({
			success: true,
			data: {
				totalComments: result.totalComments,
				newWinners: newWinners.length,
				existingWinners: existingWinners.length,
				winners: newWinners
			}
		});
	} catch (error) {
		console.error("Error processing giveaway:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to process giveaway";

		// Return more specific error messages with appropriate status codes
		if (errorMessage.includes("expired") || errorMessage.includes("connect your Instagram")) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: errorMessage },
				{ status: 401 }
			);
		}

		if (errorMessage.includes("Invalid Instagram post URL") || errorMessage.includes("does not belong")) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: errorMessage },
				{ status: 400 }
			);
		}

		return NextResponse.json<ApiResponse>(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}

export const POST = withInstagramAuth(handleProcessGiveaway);
