/**
 * Parking Slot Card Component
 * (SDG 11 — Visual representation of real-time slot status)
 */
import { motion } from 'framer-motion';
import {
  Car, Bike, Zap, Truck, Accessibility, MapPin, Clock, IndianRupee,
  ShieldCheck, Cctv, ParkingCircle, ArrowRight,
} from 'lucide-react';

const vehicleIcons = {
  car: Car,
  bike: Bike,
  ev: Zap,
  truck: Truck,
  handicapped: Accessibility,
};

const statusConfig = {
  available: { class: 'slot-available', label: 'Available', dot: 'bg-emerald-500' },
  occupied: { class: 'slot-occupied', label: 'Occupied', dot: 'bg-red-500' },
  reserved: { class: 'slot-reserved', label: 'Reserved', dot: 'bg-amber-500' },
  maintenance: { class: 'slot-maintenance', label: 'Maintenance', dot: 'bg-dark-500' },
};

const SlotCard = ({ slot, onBook, compact = false }) => {
  const VehicleIcon = vehicleIcons[slot.type] || Car;
  const statusCfg = statusConfig[slot.status] || statusConfig.available;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => slot.status === 'available' && onBook?.(slot)}
        className={`relative p-3 rounded-xl border ${statusCfg.class} cursor-pointer transition-all duration-200`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VehicleIcon className="w-4 h-4" />
            <span className="text-sm font-mono font-medium">{slot.slotNumber}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`glass-card-hover p-5 border ${statusCfg.class}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-700/60 flex items-center justify-center text-neon-400">
            <VehicleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-dark-100 text-lg">{slot.slotNumber}</h3>
            <p className="text-xs text-dark-400">Zone {slot.zone} • Floor {slot.floor}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
          <span className="text-xs font-medium text-dark-300">{statusCfg.label}</span>
        </div>
      </div>

      {/* Features */}
      {slot.features?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {slot.features.map((feat) => (
            <span
              key={feat}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-dark-700/50 text-dark-300 border border-dark-600/30"
            >
              {feat}
            </span>
          ))}
        </div>
      )}

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-600/20">
        <div className="flex items-center gap-1 text-dark-200">
          <IndianRupee className="w-4 h-4 text-neon-500" />
          <span className="font-display font-bold text-lg">{slot.pricePerHour}</span>
          <span className="text-xs text-dark-400">/hr</span>
        </div>
        {slot.status === 'available' && onBook && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(slot)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-neon-500/15 text-neon-400 border border-neon-500/30 hover:bg-neon-500/25 transition-colors"
          >
            Book <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default SlotCard;
