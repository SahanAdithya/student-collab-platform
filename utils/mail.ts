import nodemailer from "nodemailer";

interface EmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

/**
 * Dispatches an email using SMTP credentials.
 * If credentials are not present in .env.local, it falls back to a high-fidelity visual mock log in the terminal.
 */
export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<boolean> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"CollabHub Notifications" <noreply@collabhub.dev>`;

    // If SMTP is not fully configured, log a highly detailed visual envelope in development console
    if (!host || !user || !pass) {
        console.log("\n\x1b[35m============================================================\x1b[0m");
        console.log("\x1b[36m✉️  [MOCK EMAIL DISPATCHED] (Configure SMTP in .env.local to send real emails)\x1b[0m");
        console.log("\x1b[33mFrom:\x1b[0m    %s", from);
        console.log("\x1b[33mTo:\x1b[0m      %s", to);
        console.log("\x1b[33mSubject:\x1b[0m %s", subject);
        console.log("\x1b[90m------------------------------------------------------------\x1b[0m");
        console.log("\x1b[37m%s\x1b[0m", text);
        console.log("\x1b[35m============================================================\n\x1b[0m");
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html: html || text.replace(/\n/g, "<br>"),
        });

        console.log(`[SMTP EMAIL SENT] Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("[SMTP EMAIL ERROR] Failed to dispatch email:", error);
        return false;
    }
}
