
import crypto from "node:crypto";

export function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

export function getOtpHtml(otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body style="margin:0; padding:30px; background-color:#f4f4f4; font-family:Arial,sans-serif;">
        <div style="max-width:400px; margin:auto; padding:30px; background:#ffffff; border-radius:10px; text-align:center;">
            <h2 style="color:#222222;">Verify Your Email</h2>
            <p style="color:#555555;">Use the following code to complete your registration.</p>

            <div style="margin:25px 0; padding:15px; background:#f0f4ff; border-radius:8px;">
                <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#2563eb;">
                    ${otp}
                </span>
            </div>

            <p style="color:#666666; font-size:14px;">
                This code expires in 5 minutes.
            </p>
            <p style="color:#888888; font-size:12px;">
                If you did not request this code, you can ignore this email.
            </p>
        </div>
    </body>
    </html>`;
}
