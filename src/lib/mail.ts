import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Student Portal" <no-reply@studentportal.com>',
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
