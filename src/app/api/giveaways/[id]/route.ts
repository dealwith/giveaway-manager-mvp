import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { authOptions } from "lib/auth";
import { deleteGiveaway, getGiveaway, updateGiveaway } from "lib/db";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

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
		if (giveaway.userId !== session.user.id) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		return NextResponse.json<ApiResponse>({ success: true, data: giveaway });
	} catch (error) {
		console.error("Error fetching giveaway:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to fetch giveaway" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

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
		if (giveaway.userId !== session.user.id) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		const data = await req.json();
		await updateGiveaway(id, data);

		const updatedGiveaway = await getGiveaway(id);

		return NextResponse.json<ApiResponse>({
			success: true,
			data: updatedGiveaway
		});
	} catch (error) {
		console.error("Error updating giveaway:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to update giveaway" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

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
		if (giveaway.userId !== session.user.id) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Unauthorized" },
				{ status: 403 }
			);
		}

		await deleteGiveaway(id);

		return NextResponse.json<ApiResponse>({ success: true });
	} catch (error) {
		console.error("Error deleting giveaway:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to delete giveaway" },
			{ status: 500 }
		);
	}
}
