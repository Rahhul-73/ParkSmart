/**
 * User Dashboard (Dashboard.jsx)
 * Provides personal booking overview, active check-in/out controls, and history.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useParking } from '../../context/ParkingContext';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import BookingCard from '../../components/parking/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { myBookings, fetchMyBookings, cancelBooking, bookingsLoading } = useParking();
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const activeBooking = myBookings.find((b) => b.status === 'active' || b.status === 'pending');

  const handleCheckIn = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/checkin`);
      toast.success('Successfully checked in! Have a safe stay 🚗');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/checkout`);
      toast.success('Checked out successfully! Payment completed 💳');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome, <span className="text-neon-gradient">{user?.name}</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Registered Vehicle: <span className="font-mono text-neon-400 font-semibold">{user?.vehicleNumber || 'Not set'}</span> ({user?.vehicleType?.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMyBookings()}
            className="p-2.5 rounded-xl glass-card text-dark-300 hover:text-white border border-dark-600/40 transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/parking" className="btn-neon flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4 relative z-10" />
            <span>Book A Slot</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Car}
          label="Total Reservations"
          value={myBookings.length}
          color="neon"
        />
        <StatCard
          icon={Clock}
          label="Active Session"
          value={myBookings.filter((b) => b.status === 'active').length}
          color="emerald"
        />
        <StatCard
          icon={Calendar}
          label="Pending Bookings"
          value={myBookings.filter((b) => b.status === 'pending').length}
          color="amber"
        />
        <StatCard
          icon={Zap}
          label="EV Priority Status"
          value={user?.vehicleType === 'ev' ? 'Active' : 'Standard'}
          color="accent"
        />
      </div>

      {/* Current Active/Pending Booking Action Banner */}
      {activeBooking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border border-neon-500/40 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neon-500/15 text-neon-300 border border-neon-500/30">
                Current Active Ticket
              </span>
              <h2 className="text-xl font-display font-bold text-white mt-2">
                Slot <span className="text-neon-400 font-mono">{activeBooking.slot?.slotNumber}</span> (Floor {activeBooking.slot?.floor}, Zone {activeBooking.slot?.zone})
              </h2>
              <p className="text-xs text-dark-300 mt-1">
                Vehicle: {activeBooking.vehicleNumber} • Status: <span className="capitalize text-white font-medium">{activeBooking.status}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeBooking.status === 'pending' && (
                <button
                  onClick={() => handleCheckIn(activeBooking._id)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Check In Now
                </button>
              )}
              {activeBooking.status === 'active' && (
                <button
                  onClick={() => handleCheckOut(activeBooking._id)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Check Out &amp; Pay
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* History Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
          <h2 className="text-xl font-display font-bold text-white">My Reservations</h2>
          <div className="flex gap-1.5 overflow-x-auto">
            {['all', 'pending', 'active', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-neon-500/15 text-neon-400 border border-neon-500/30'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {bookingsLoading ? (
          <LoadingSpinner text="Fetching reservations..." />
        ) : filteredBookings.length === 0 ? (
          <div className="glass-card p-12 text-center border border-dark-600/30">
            <Car className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No reservations found</h3>
            <p className="text-xs text-dark-400 mt-1 max-w-sm mx-auto">
              You haven't made any bookings in this filter category yet. Reserve a slot to get started!
            </p>
            <Link to="/parking" className="btn-neon inline-flex items-center gap-2 px-5 py-2 text-xs mt-4">
              <span>Book Slot Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBookings.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={cancelBooking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
