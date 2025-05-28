import { Resend } from "resend";
import { SITE } from '@constants/site';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE.NAME} <noreply@${process.env.RESEND_DOMAIN || 'example.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}
