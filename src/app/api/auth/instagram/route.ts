import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { authOptions } from "lib/auth";
import { updateUserInstagramCredentials } from "lib/db";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface InstagramTokenResponse {
	access_token: string;
	token_type: string;
	expires_in?: number;
}

interface FacebookPage {
	id: string;
	name: string;
	instagram_business_account?: {
		id: string;
		username?: string;
	};
}

interface FacebookPagesResponse {
	data: FacebookPage[];
}

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const { searchParams } = new URL(req.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");

	if (error) {
		return NextResponse.redirect(
			`${BASE_URL}/dashboard/connections?error=instagram_auth_failed&message=${encodeURIComponent(error)}`
		);
	}

	if (!code) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Authorization code not provided" },
			{ status: 400 }
		);
	}

	try {
		// Exchange code for access token using Facebook OAuth
		const tokenResponse = await axios.get<InstagramTokenResponse>(
			"https://graph.facebook.com/v23.0/oauth/access_token",
			{
				params: {
					client_id: FACEBOOK_APP_ID,
					client_secret: FACEBOOK_APP_SECRET,
					redirect_uri: `${BASE_URL}/api/auth/instagram`,
					code
				}
			}
		);

		const { access_token } = tokenResponse.data;

		// Get user's Facebook pages to find Instagram Business Account
		const pagesResponse = await axios.get<FacebookPagesResponse>(
			"https://graph.facebook.com/v23.0/me/accounts",
			{
				params: {
					fields: "id,name,instagram_business_account{id,username}",
					access_token
				}
			}
		);

		const pages = pagesResponse.data.data;
		const pageWithInstagram = pages.find(
			(page) => page.instagram_business_account?.id
		);

		if (!pageWithInstagram?.instagram_business_account) {
			return NextResponse.redirect(
				`${BASE_URL}/dashboard/connections?error=instagram_account_not_found&message=${encodeURIComponent("No Instagram Business Account found. Please ensure your Instagram account is connected to a Facebook page and is set as a Business account.")}`
			);
		}

		const instagramAccount = pageWithInstagram.instagram_business_account;

		// Get the page access token for the page that has the Instagram account
		let pageAccessToken = access_token; // Default to user token

		// Try to get the page access token
		try {
			const pageTokenResponse = await axios.get(
				`https://graph.facebook.com/v23.0/${pageWithInstagram.id}`,
				{
					params: {
						fields: "access_token",
						access_token
					}
				}
			);

			if (pageTokenResponse.data.access_token) {
				pageAccessToken = pageTokenResponse.data.access_token;
				console.log("Successfully obtained page access token");
			}
		} catch (pageTokenError) {
			console.error(
				"Failed to get page access token, using user token:",
				pageTokenError
			);
		}

		// Calculate expiration date (Instagram tokens typically last 60 days)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 60);

		// Save Instagram credentials to user (use page access token for better permissions)
		await updateUserInstagramCredentials(session.user.id, {
			accessToken: pageAccessToken,
			businessAccountId: instagramAccount.id,
			username: instagramAccount.username,
			expiresAt
		});

		return NextResponse.redirect(
			`${BASE_URL}/dashboard/connections?success=instagram_connected&username=${encodeURIComponent(instagramAccount.username || instagramAccount.id)}`
		);
	} catch (error) {
		console.error("Instagram OAuth error:", error);

		let errorMessage = "Failed to connect Instagram account";
		let errorDetails = "";

		if (axios.isAxiosError(error)) {
			console.error("Error response data:", error.response?.data);
			console.error("Error response status:", error.response?.status);
			console.error("Error request URL:", error.config?.url);
			console.error("Error request params:", error.config?.params);

			errorMessage =
				error.response?.data?.error_description ||
				error.response?.data?.error?.message ||
				error.message;

			if (error.response?.data?.error) {
				errorDetails = ` (${error.response.data.error.type || error.response.data.error})`;
			}
		}

		return NextResponse.redirect(
			`${BASE_URL}/dashboard/connections?error=instagram_auth_failed&message=${encodeURIComponent(errorMessage + errorDetails)}`
		);
	}
}
