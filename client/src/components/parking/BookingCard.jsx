/**
 * Booking Card Component — displays a user's booking
 */
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Car, IndianRupee, X, LogIn, LogOut } from 'lucide-react';

const statusColors = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  completed: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/30',
  expired: 'text-dark-400 bg-dark-600/30 border-dark-500/30',
};

const BookingCard = ({ booking, onCancel }) => {
  const slot = booking.slot || {};
  const statusClass = statusColors[booking.status] || statusColors.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-dark-100 text-lg">
            {slot.slotNumber || 'N/A'}
          </h3>
          <p className="text-xs text-dark-400">
            Zone {slot.zone} • Floor {slot.floor}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
          {booking.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-dark-300">
          <Car className="w-4 h-4 text-neon-500" />
          <span>{booking.vehicleNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <IndianRupee className="w-4 h-4 text-accent-500" />
          <span className="font-semibold">{booking.totalAmount?.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <Calendar className="w-4 h-4 text-neon-500" />
          <span>{new Date(booking.startTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <Clock className="w-4 h-4 text-accent-500" />
          <span>
            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      {['pending', 'active'].includes(booking.status) && (
        <div className="flex gap-2 pt-3 border-t border-dark-600/20">
          {booking.status === 'pending' && onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCancel(booking._id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BookingCard;
