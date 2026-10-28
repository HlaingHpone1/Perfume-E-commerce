type EmailLayoutOptions = {
  previewText: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

const COLORS = {
  canvas: "#f5f3ee",
  card: "#ffffff",
  ink: "#1c2420",
  muted: "#6b736e",
  line: "#e4e0d8",
  accent: "#2f4a3c",
  accentText: "#f8f6f1",
  bronze: "#8a7355",
} as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmailLayout({
  previewText,
  title,
  bodyHtml,
  cta,
  footerNote,
}: EmailLayoutOptions): string {
  const safePreview = escapeHtml(previewText);
  const safeTitle = escapeHtml(title);
  const ctaBlock = cta
    ? `
      <tr>
        <td style="padding: 8px 0 28px;">
          <a href="${escapeHtml(cta.href)}"
             style="display:inline-block;background:${COLORS.accent};color:${COLORS.accentText};text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;padding:16px 28px;border:0;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>`
    : "";

  const footer = footerNote
    ? `<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${COLORS.muted};">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.canvas};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${safePreview}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.canvas};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.line};">
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid ${COLORS.line};">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.04em;color:${COLORS.ink};">
                FragranceHub
              </p>
              <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.bronze};">
                Atelier
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 16px;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;font-weight:normal;color:${COLORS.ink};">
                      ${safeTitle}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.muted};">
                    ${bodyHtml}
                  </td>
                </tr>
                ${ctaBlock}
                <tr>
                  <td style="padding-top:8px;border-top:1px solid ${COLORS.line};">
                    ${footer}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 28px;background:${COLORS.canvas};border-top:1px solid ${COLORS.line};">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.muted};">
                FragranceHub
              </p>
              <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${COLORS.muted};">
                A quiet collection for the signature scent hunt.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderPasswordResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Reset your FragranceHub password";
  const html = renderEmailLayout({
    previewText: "Reset your FragranceHub password securely in one step.",
    title: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 14px;">We received a request to reset the password for your FragranceHub account.</p>
      <p style="margin:0 0 14px;">Use the button below to choose a new password. This link will expire soon for your security.</p>
      <p style="margin:0;">If you did not request this, you can safely ignore this email — your password will stay the same.</p>
    `,
    cta: {
      label: "Reset Password",
      href: resetUrl,
    },
    footerNote: `If the button does not work, copy and paste this link into your browser:<br /><a href="${escapeHtml(resetUrl)}" style="color:${COLORS.accent};word-break:break-all;">${escapeHtml(resetUrl)}</a>`,
  });

  const text = [
    "Reset your FragranceHub password",
    "",
    "We received a request to reset the password for your FragranceHub account.",
    `Open this link to choose a new password: ${resetUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  return { subject, html, text };
}
