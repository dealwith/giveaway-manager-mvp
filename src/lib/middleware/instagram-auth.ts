import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { authOptions } from "lib/auth";
import { getUser } from "lib/db";
import { InstagramCredentials } from "lib/instagram";

export interface RequestWithInstagramCredentials extends NextRequest {
	instagramCredentials: InstagramCredentials;
	userId: string;
}

type RouteHandler = (
	req: RequestWithInstagramCredentials,
	context: { params: Promise<{ id: string }> }
) => Promise<NextResponse>;

export function withInstagramAuth(handler: RouteHandler) {
	return async (
		req: NextRequest,
		context: { params: Promise<{ id: string }> }
	): Promise<NextResponse> => {
		try {
			// Check authentication
			const session = await getServerSession(authOptions);

			if (!session) {
				return NextResponse.json<ApiResponse>(
					{ success: false, error: "Unauthorized" },
					{ status: 401 }
				);
			}

			// Get user with Instagram credentials
			const user = await getUser(session.user.email);

			if (!user) {
				return NextResponse.json<ApiResponse>(
					{ success: false, error: "User not found" },
					{ status: 404 }
				);
			}

			// Validate Instagram credentials
			if (!user.instagram?.accessToken || !user.instagram?.businessAccountId) {
				return NextResponse.json<ApiResponse>(
					{
						success: false,
						error:
							"Instagram Business Account not connected. Please connect your Instagram account first.",
						code: "INSTAGRAM_NOT_CONNECTED"
					},
					{ status: 400 }
				);
			}

			// Check if Instagram token is expired
			if (user.instagram.expiresAt && new Date() > user.instagram.expiresAt) {
				return NextResponse.json<ApiResponse>(
					{
						success: false,
						error:
							"Instagram access token has expired. Please reconnect your Instagram account.",
						code: "INSTAGRAM_TOKEN_EXPIRED"
					},
					{ status: 401 }
				);
			}

			// Create credentials object
			const instagramCredentials: InstagramCredentials = {
				accessToken: user.instagram.accessToken,
				businessAccountId: user.instagram.businessAccountId
			};

			// Attach credentials and user ID to request
			const requestWithCredentials = req as RequestWithInstagramCredentials;
			requestWithCredentials.instagramCredentials = instagramCredentials;
			requestWithCredentials.userId = session.user.id;

			// Call the actual handler
			return await handler(requestWithCredentials, context);
		} catch (error) {
			console.error("Instagram auth middleware error:", error);

			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: "Failed to validate Instagram credentials",
					code: "INSTAGRAM_AUTH_ERROR"
				},
				{ status: 500 }
			);
		}
	};
}
