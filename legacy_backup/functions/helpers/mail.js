const nodemailer = require('nodemailer');

/**
 * Create and return a Nodemailer transporter using environment variables.
 *
 * Required environment variables:
 *   SMTP_HOST – SMTP server hostname
 *   SMTP_PORT – SMTP server port
 *   SMTP_USER – SMTP username
 *   SMTP_PASS – SMTP password
 *   SMTP_FROM – default FROM address
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465; // true for 465, false for other ports

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Send an email using the configured transporter.
 *
 * @param {Object} options
 * @param {string|string[]} options.to – recipient(s)
 * @param {string} options.subject – email subject
 * @param {string} options.text – plaintext body
 * @param {string} [options.html] – HTML body
 * @param {string} [options.from] – optional from address
 */
async function sendMail({ to, subject, text, html, from }) {
  const transporter = getTransporter();
  const mailOptions = {
    from: from || process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendMail };