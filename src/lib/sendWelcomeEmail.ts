import axios from "axios";
import { NextResponse } from "next/server";

import { API } from "constants/api";
import { SITE } from "constants/site";

import { EmailTemplates } from "./template/email-templates";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const sendWelcomeEmail = async (email: string, name?: string) => {
	if (!email || email.trim() === "") {
		console.error("Error sending email: Email is required");

		return NextResponse.json(
			{ success: false, error: "Email is required" },
			{ status: 400 }
		);
	}

	const data = {
		to: email.trim(),
		subject: `Welcome to ${SITE.NAME}!`,
		html: EmailTemplates.WELCOME(name)
	};

	try {
		const response = await axios.post(`${BASE_URL}${API.EMAIL}`, data);

		if (response.status !== 200) {
			return NextResponse.json(
				{ success: false, error: "Failed to send email" },
				{ status: 500 }
			);
		} else {
			return NextResponse.json({
				success: true,
				data: response.data
			});
		}
	} catch (error) {
		console.error("Error sending email:", error);

		return NextResponse.json(
			{ success: false, error: "Failed to send email" },
			{ status: 500 }
		);
	}
};
