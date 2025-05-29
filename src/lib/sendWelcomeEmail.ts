import axios from "axios"
import { SITE } from "@constants/site";
import { API } from "@constants/api";
import { EmailTemplates } from "./template/email-templates";
import { NextResponse } from "next/server";

export const sendWelcomeEmail = async (
  email: string,
  name?: string
) => {
  if (!email || email.trim() === '') {
    console.error("Error sending email: Email is required");
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    );
  }

  const data = {
    to: email.trim(),
    subject: `Welcome to ${SITE.NAME}!`,
    html: EmailTemplates.WELCOME(name),
  }

  try {
    const response = await axios.post(API.EMAIL, data)

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    } else {
      return NextResponse.json({
        success: true,
        data: response.data,
      });
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
