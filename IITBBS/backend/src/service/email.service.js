import nodemailer from 'nodemailer';
import config from '../config/config.js';

let transporter = null;

if (config.GOOGLE_USER && config.GOOGLE_REFRESH_TOKEN) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.GOOGLE_USER,
                clientId: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                refreshToken: config.GOOGLE_REFRESH_TOKEN,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        transporter.verify((error) => {
            if (error) {
                console.warn('Email service warning:', error.message);
            } else {
                console.log('Email service ready');
            }
        });
    } catch (err) {
        console.warn('Email service initialization skipped:', err.message);
    }
}

export const sendEmail = async (to, subject, text, html) => {
    if (!transporter) {
        console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Text: ${text}`);
        return { messageId: `mock-${Date.now()}` };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Cosmic Watch" <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            ...(html ? { html } : {}),
        });
        return info;
    } catch (error) {
        console.warn('Failed to send real email, logging fallback:', error.message);
        console.log(`[Email Fallback] To: ${to} | Subject: ${subject} | Text: ${text}`);
        return { messageId: `fallback-${Date.now()}` };
    }
};
