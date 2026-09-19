const nodemailer = require('nodemailer');

let testAccount = null;
let transporter = null;

/**
 * Initializes and returns a nodemailer transporter.
 * Uses real SMTP credentials if provided in env, otherwise generates
 * a persistent Ethereal test account and logs message preview links.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  // 1. Check for real SMTP credentials in environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Configured real SMTP email transporter');
    return transporter;
  }

  // 2. Fallback to Ethereal Test Account (zero setup needed)
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test email account initialized:', testAccount.user);
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

/**
 * Sends an email notification.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML formatted body
 * @returns {Promise<Object>} Result object with messageId and optional previewUrl
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const tx = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AgriRent Platform" <no-reply@agrirent.com>',
      to,
      subject,
      text: text || '',
      html: html || `<p>${text || subject}</p>`,
    };

    const info = await tx.sendMail(mailOptions);

    console.log(`✉️ [EMAIL SENT] To: ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
    
    // Ethereal preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [ETHEREAL PREVIEW] View email in browser: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fire-and-forget wrapper for sending emails without blocking the main request/response cycle.
 */
const sendEmailNotification = (options) => {
  // Execute asynchronously without blocking caller
  setImmediate(() => {
    sendEmail(options).catch((err) => {
      console.error('❌ Background email dispatch error:', err.message);
    });
  });
};

module.exports = {
  sendEmail,
  sendEmailNotification,
};
