/**
 * Email Service  (PO5 — Modern Tool Usage: Nodemailer)
 *
 * SDG 11 — Sustainable Cities: Email confirmations reduce
 *          no-shows and improve parking lot utilization.
 */
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  try {
    const transporter = createTransporter();
    const { slotNumber, startTime, endTime, totalAmount, vehicleNumber } = bookingDetails;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: '🅿️ ParkSmart — Booking Confirmed!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <h1 style="color: #06b6d4; text-align: center;">ParkSmart</h1>
          <h2 style="text-align: center; color: #a78bfa;">Booking Confirmed ✅</h2>
          <div style="background: #1e293b; padding: 24px; border-radius: 12px; margin: 16px 0;">
            <p><strong style="color: #06b6d4;">Slot:</strong> ${slotNumber}</p>
            <p><strong style="color: #06b6d4;">Vehicle:</strong> ${vehicleNumber}</p>
            <p><strong style="color: #06b6d4;">From:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong style="color: #06b6d4;">To:</strong> ${new Date(endTime).toLocaleString()}</p>
            <p><strong style="color: #06b6d4;">Total:</strong> ₹${totalAmount}</p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px;">
            SDG 11 — Smart parking for sustainable cities 🌍
          </p>
        </div>
      `,
    });

    console.log(`📧 Booking confirmation sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw — email failure shouldn't break the booking flow
  }
};

/**
 * Send generic notification email
 */
const sendNotification = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

module.exports = { sendBookingConfirmation, sendNotification };
