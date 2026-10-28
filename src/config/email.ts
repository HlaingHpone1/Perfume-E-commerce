import { Resend } from "resend";
import { renderPasswordResetEmail } from "@/config/email-templates";

const DEFAULT_FROM = "FragranceHub <onboarding@resend.dev>";

export async function sendPasswordResetEmail(email: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Password reset email is not configured");
  }

  const resend = new Resend(apiKey);
  const { subject, html, text } = renderPasswordResetEmail(url);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    to: email,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
