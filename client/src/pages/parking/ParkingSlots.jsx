/**
 * Parking Slots View & Reservation Page (ParkingSlots.jsx)
 * Interactive zone/floor/vehicle filters, visual slot grid, and booking modal.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Filter,
  Layers,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  X,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useParking } from '../../context/ParkingContext';
import { bookingSchema } from '../../schemas/validation';
import SlotCard from '../../components/parking/SlotCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ParkingSlots = () => {
  const { isAuthenticated, user } = useAuth();
  const { slots, slotsLoading, fetchSlots, createBooking } = useParking();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Filters state
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchSlots({
      zone: selectedZone,
      floor: selectedFloor,
      type: selectedType,
      status: selectedStatus,
    });
  }, [fetchSlots, selectedZone, selectedFloor, selectedType, selectedStatus]);

  // Default times for booking form: start now, end in 2 hours
  const now = new Date();
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const later = new Date(now.getTime() + 2 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      slotId: '',
      vehicleNumber: user?.vehicleNumber || '',
      vehicleType: user?.vehicleType || 'car',
      startTime: defaultStart,
      endTime: later,
    },
  });

  const watchStart = watch('startTime');
  const watchEnd = watch('endTime');

  // Compute estimated cost
  let durationHours = 2;
  if (watchStart && watchEnd) {
    const diff = new Date(watchEnd) - new Date(watchStart);
    durationHours = Math.max(0.5, Math.round((diff / (1000 * 60 * 60)) * 10) / 10);
  }
  const estimatedTotal = selectedSlot
    ? Math.round(durationHours * selectedSlot.pricePerHour)
    : 0;

  const handleOpenBook = (slot) => {
    if (!isAuthenticated) {
      toast('Please sign in to reserve a slot', { icon: '🔑' });
      navigate('/login');
      return;
    }
    setSelectedSlot(slot);
    setValue('slotId', slot._id);
    setValue('vehicleNumber', user?.vehicleNumber || '');
    setValue('vehicleType', slot.type === 'ev' ? 'ev' : user?.vehicleType || 'car');
    setModalOpen(true);
  };

  const onSubmitBooking = async (data) => {
    setBookingLoading(true);
    try {
      await createBooking({
        slotId: data.slotId,
        vehicleNumber: data.vehicleNumber.toUpperCase(),
        vehicleType: data.vehicleType,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      setModalOpen(false);
      reset();
      fetchSlots();
      navigate('/dashboard');
    } catch (err) {
      // toast shown in context
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Smart Slot Reservation
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Browse live campus parking slots, check amenities, and reserve with one click.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-dark-200">Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-dark-200">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-dark-200">Occupied</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border border-dark-600/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Zone */}
        <div>
          <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">
            Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="input-glass py-2 text-xs"
          >
            <option value="" className="bg-dark-900">All Zones (A - E)</option>
            {['A', 'B', 'C', 'D', 'E'].map((z) => (
              <option key={z} value={z} className="bg-dark-900">Zone {z}</option>
            ))}
          </select>
        </div>

        {/* Floor */}
        <div>
          <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">
            Floor
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="input-glass py-2 text-xs"
          >
            <option value="" className="bg-dark-900">All Floors</option>
            <option value="0" className="bg-dark-900">Ground (0)</option>
            <option value="1" className="bg-dark-900">Floor 1</option>
            <option value="2" className="bg-dark-900">Floor 2</option>
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">
            Vehicle Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-glass py-2 text-xs"
          >
            <option value="" className="bg-dark-900">All Vehicles</option>
            <option value="car" className="bg-dark-900">Car</option>
            <option value="bike" className="bg-dark-900">Bike / Two-Wheeler</option>
            <option value="ev" className="bg-dark-900">EV Charging</option>
            <option value="truck" className="bg-dark-900">Truck / Heavy</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">
            Availability
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-glass py-2 text-xs"
          >
            <option value="" className="bg-dark-900">All Statuses</option>
            <option value="available" className="bg-dark-900">Available Only</option>
            <option value="reserved" className="bg-dark-900">Reserved</option>
            <option value="occupied" className="bg-dark-900">Occupied</option>
          </select>
        </div>
      </div>

      {/* Slots Display */}
      {slotsLoading ? (
        <LoadingSpinner text="Scanning smart sensors..." />
      ) : slots.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dark-600/30">
          <Car className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No slots match your filters</h3>
          <p className="text-xs text-dark-400 mt-1">Try resetting zone, floor or vehicle filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <SlotCard key={slot._id} slot={slot} onBook={handleOpenBook} />
          ))}
        </div>
      )}

      {/* ─── Reservation Modal ─── */}
      <AnimatePresence>
        {modalOpen && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg p-6 border border-dark-600/50 relative overflow-hidden"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neon-500/15 text-neon-300 border border-neon-500/30">
                  Confirm Reservation
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-2">
                  Slot <span className="font-mono text-neon-400">{selectedSlot.slotNumber}</span>
                </h3>
                <p className="text-xs text-dark-300">
                  Zone {selectedSlot.zone} • Floor {selectedSlot.floor} • Rate: ₹{selectedSlot.pricePerHour}/hr
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="KA-01-AB-1234"
                    {...register('vehicleNumber')}
                    className="input-glass font-mono uppercase"
                  />
                  {errors.vehicleNumber && (
                    <p className="text-xs text-red-400 mt-1">{errors.vehicleNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1">
                    Vehicle Type
                  </label>
                  <select {...register('vehicleType')} className="input-glass">
                    <option value="car" className="bg-dark-900">Car</option>
                    <option value="bike" className="bg-dark-900">Bike</option>
                    <option value="ev" className="bg-dark-900">Electric Vehicle (EV)</option>
                    <option value="truck" className="bg-dark-900">Truck</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('startTime')}
                      className="input-glass text-xs"
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-400 mt-1">{errors.startTime.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('endTime')}
                      className="input-glass text-xs"
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-400 mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                {/* Estimation box */}
                <div className="p-3.5 rounded-xl bg-dark-900/60 border border-dark-600/30 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-dark-400">Duration: ~{durationHours} hours</p>
                    <p className="text-dark-400">Rate: ₹{selectedSlot.pricePerHour}/hr</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-dark-400 font-semibold block">Total Estimated</span>
                    <span className="text-xl font-display font-bold text-neon-400">
                      ₹{estimatedTotal}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-dark-600/40 text-dark-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 btn-neon py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>{bookingLoading ? 'Reserving...' : 'Confirm & Reserve'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParkingSlots;
