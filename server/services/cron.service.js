/**
 * ══════════════════════════════════════════════════════════════
 *  Cron Job Service (Auto-Release + Owner Notification)
 *  (PO3 — System Automation, PO11 — Operations Management)
 *  SDG 11 — Sustainable Cities: Freed slots reduce idle cruising
 * ══════════════════════════════════════════════════════════════
 */

const cron = require('node-cron');
const { Reservation, Slot, ParkingLot, User } = require('../models');
const { sendNotification } = require('./email.service');

/**
 * Send expiry alert email to the owner using their registered email.
 * Also mock-logs an SMS with their registered phone number.
 */
const notifyOwnerOnExpiry = async (reservation) => {
  try {
    // Populate user from DB using the userId stored in the reservation
    const user = await User.findById(reservation.userId).select('name email phone');
    if (!user) return;

    const slot = await Slot.findById(reservation.slotId).select('slotNumber');
    const slotLabel = slot ? slot.slotNumber : reservation.slotId;

    const endTimeStr = new Date(reservation.endTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // ── 1. Email Notification ──────────────────────────────────
    const subject = '⚠️ ParkSmart — Your Parking Time Has Expired!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
                  background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
        <h1 style="color: #06b6d4; text-align: center; margin-bottom: 4px;">🅿️ ParkSmart</h1>
        <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 0;">
          Parking Slot Reservation System
        </p>

        <div style="background: #f43f5e22; border: 1px solid #f43f5e55;
                    padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h2 style="color: #f43f5e; margin: 0 0 8px 0;">⏰ Time's Up, ${user.name}!</h2>
          <p style="margin: 0; color: #fca5a5; font-size: 14px;">
            Your reserved parking slot has expired. Please vacate immediately.
          </p>
        </div>

        <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin: 16px 0;">
          <p style="margin: 8px 0;">
            <strong style="color: #06b6d4;">📍 Slot:</strong> ${slotLabel}
          </p>
          <p style="margin: 8px 0;">
            <strong style="color: #06b6d4;">🚗 Vehicle:</strong> ${reservation.vehicleNumber}
          </p>
          <p style="margin: 8px 0;">
            <strong style="color: #06b6d4;">⏰ Expired At:</strong> ${endTimeStr} IST
          </p>
          <p style="margin: 8px 0;">
            <strong style="color: #06b6d4;">💰 Amount Paid:</strong> ₹${reservation.totalAmount}
          </p>
        </div>

        <div style="background: #92400e33; border: 1px solid #f59e0b55;
                    padding: 16px; border-radius: 10px; margin: 16px 0;">
          <p style="margin: 0; color: #fbbf24; font-size: 13px; text-align: center;">
            ⚠️ Continuing to occupy the slot after expiry may result in
            <strong>overstay penalties</strong>. Please leave immediately.
          </p>
        </div>

        <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 24px;">
          SDG 11 — Smart parking for sustainable cities 🌍 | ParkSmart System
        </p>
      </div>
    `;

    await sendNotification(user.email, subject, html);
    console.log(`📧 [Expiry Alert] Email sent to ${user.email} (${user.name}) for slot ${slotLabel}`);

    // ── 2. SMS Mock (logs to console with registered phone) ───
    if (user.phone) {
      const smsText =
        `[ParkSmart SMS] Hi ${user.name}, your parking slot ${slotLabel} ` +
        `(Vehicle: ${reservation.vehicleNumber}) expired at ${endTimeStr} IST. ` +
        `Please vacate immediately to avoid penalties.`;
      console.log(`📱 [SMS → ${user.phone}]: ${smsText}`);
    } else {
      console.log(`📱 [SMS] No phone registered for user ${user.name} (${user.email})`);
    }
  } catch (err) {
    console.error('[Notify Error] Failed to notify owner on expiry:', err.message);
  }
};

/**
 * Initializes background cron jobs
 */
const initCronJobs = () => {
  // Run every 2 minutes to catch expiries promptly
  cron.schedule('*/2 * * * *', async () => {
    try {
      const now = new Date();

      // Find ALL active/pending reservations whose end time has passed
      const expiredReservations = await Reservation.find({
        status: { $in: ['pending', 'active'] },
        endTime: { $lt: now },
        notifiedOnExpiry: { $ne: true }, // don't re-notify
      });

      if (expiredReservations.length > 0) {
        console.log(`\n[Cron] ⏰ ${expiredReservations.length} expired reservation(s) found at ${now.toLocaleTimeString('en-IN')}`);

        for (const res of expiredReservations) {
          // ─ Notify the owner via email + SMS ─
          await notifyOwnerOnExpiry(res);

          // ─ Mark as cancelled and free the slot ─
          res.status = 'cancelled';
          res.notifiedOnExpiry = true;
          res.penalty = {
            amount: 0,
            reason: 'Auto-released: Reservation window expired',
          };
          await res.save();

          await Slot.findByIdAndUpdate(res.slotId, { status: 'available' });
          await ParkingLot.findByIdAndUpdate(res.lotId, {
            $inc: { availableSlots: 1 },
          });

          console.log(`✅ [Cron] Slot freed for reservation ${res._id} | Vehicle: ${res.vehicleNumber}`);
        }
      } else {
        console.log(`[Cron] ✅ ${now.toLocaleTimeString('en-IN')} — No expired reservations.`);
      }
    } catch (error) {
      console.error('[Cron Error]', error.message);
    }
  });

  console.log('⏰ Reservation expiry cron active (every 2 mins) — notifies owner on expiry');
};

module.exports = { initCronJobs };
