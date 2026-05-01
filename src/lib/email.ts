import { randomBytes } from "node:crypto";
import { log } from "./log";

export interface EmailInput {
  to: string[];
  subject: string;
  html: string;
  text: string;
}

export interface EmailResult {
  id: string;
}

export interface EmailProvider {
  send(input: EmailInput): Promise<EmailResult>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(input: EmailInput): Promise<EmailResult> {
    const id = `console-${Date.now()}-${randomBytes(4).toString("hex")}`;
    log.info(
      "email_send",
      {
        provider: "console",
        id,
        subject: input.subject,
        recipientCount: input.to.length,
      },
      { pii: false }
    );
    return { id };
  }
}

// ResendProvider — would call https://api.resend.com/emails with RESEND_API_KEY.
// PostmarkProvider — would call https://api.postmarkapp.com/email with POSTMARK_API_KEY.
// SmtpProvider — would dial SMTP_HOST:SMTP_PORT with SMTP_USER/SMTP_PASS via nodemailer.
// None implemented yet — bring them online when a provider is chosen.

export function getEmailProvider(): EmailProvider {
  const choice = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  if (choice && choice !== "console") {
    log.warn("email_provider_fallback", {
      requested: choice,
      using: "console",
      reason: "provider_not_implemented",
    });
  }
  return new ConsoleEmailProvider();
}
