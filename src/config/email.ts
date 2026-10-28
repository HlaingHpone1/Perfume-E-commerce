import { Resend } from "resend";

const DEFAULT_FROM = "FragranceHub <onboarding@resend.dev>";

export async function sendPasswordResetEmail(email: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Password reset email is not configured");
  }

  const resend = new Resend(apiKey);
  const safeUrl = url.replace(/"/g, "&quot;");

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || DEFAULT_FROM,
    to: email,
    subject: "Reset your FragranceHub password",
    html: `
      <p>We received a request to reset your FragranceHub password.</p>
      <p><a href="${safeUrl}">Reset your password</a></p>
      <p>If you did not ask for this, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
