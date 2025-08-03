import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { authOptions } from "lib/auth";
import { removeUserInstagramCredentials } from "lib/db";

export async function POST() {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		await removeUserInstagramCredentials(session.user.id);

		return NextResponse.json<ApiResponse>({
			success: true,
			data: { message: "Instagram account disconnected successfully" }
		});
	} catch (error) {
		console.error("Error disconnecting Instagram account:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to disconnect Instagram account" },
			{ status: 500 }
		);
	}
}
