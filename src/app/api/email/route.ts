import { Resend } from "resend";
import { SITE } from '@constants/site';
import { NextRequest, NextResponse } from 'next/server';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailOptions = await request.json();
    const { to, subject, html, text } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Missing `to` field.' },
        { status: 422 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Missing `subject` field.' },
        { status: 422 }
      );
    }

    if (!html) {
      return NextResponse.json(
        { success: false, error: 'Missing `html` field.' },
        { status: 422 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: `${SITE.NAME} <noreply@${process.env.RESEND_DOMAIN || 'example.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Exception sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
