import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { ApiResponse } from "app-types/api";
import { authOptions } from "lib/auth";
import { createCheckoutSession } from "lib/stripe-server";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		const { priceId, returnUrl } = await req.json();

		if (!priceId || !returnUrl) {
			return NextResponse.json<ApiResponse>(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const checkoutSession = await createCheckoutSession({
			userId: session.user.id,
			priceId,
			returnUrl
		});

		return NextResponse.json<ApiResponse>({
			success: true,
			data: checkoutSession
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);

		return NextResponse.json<ApiResponse>(
			{ success: false, error: "Failed to create checkout session" },
			{ status: 500 }
		);
	}
}
