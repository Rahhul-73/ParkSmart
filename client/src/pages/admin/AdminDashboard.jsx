/**
 * Admin Dashboard (AdminDashboard.jsx)
 * Visual Analytics with Recharts, User Management, and All Bookings oversight.
 * (PO11 — Project Management & Oversight, SDG 11 & 13)
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Car,
  Calendar,
  IndianRupee,
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState('analytics');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/bookings?limit=10'),
      ]);
      setStats(dashRes.data?.data);
      setUsers(usersRes.data?.data?.users || []);
      setBookings(bookingsRes.data?.data?.bookings || []);
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(res.data?.message || 'User status updated');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling campus analytics..." />;
  }

  const overview = stats?.overview || {};
  const dailyData = stats?.dailyBookings || [];
  const vehicleData = (stats?.vehicleDistribution || []).map((v) => ({
    name: v._id.toUpperCase(),
    value: v.count,
  }));
  const zoneData = (stats?.zoneUsage || []).map((z) => ({
    zone: `Zone ${z._id}`,
    bookings: z.count,
    revenue: z.revenue,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Command</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">
            Campus Parking Analytics &amp; Management
          </h1>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2">
          {['analytics', 'users', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                viewTab === tab
                  ? 'bg-neon-500/20 text-neon-300 border border-neon-500/40 shadow-neon-cyan'
                  : 'glass-card text-dark-300 hover:text-white border border-dark-600/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Registered Users"
          value={overview.totalUsers || 0}
          color="neon"
        />
        <StatCard
          icon={Car}
          label="Total Managed Slots"
          value={overview.totalSlots || 0}
          color="accent"
        />
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={overview.totalBookings || 0}
          color="emerald"
        />
        <StatCard
          icon={Activity}
          label="Live Active Slots"
          value={overview.activeBookings || 0}
          color="amber"
        />
        <StatCard
          icon={IndianRupee}
          label="Platform Revenue"
          value={`₹${overview.totalRevenue || 0}`}
          color="neon"
        />
      </div>

      {/* ─── TAB 1: ANALYTICS ─── */}
      {viewTab === 'analytics' && (
        <div className="space-y-8">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart: Daily Trend */}
            <div className="lg:col-span-2 glass-card p-6 border border-dark-600/40">
              <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neon-400" />
                7-Day Reservation Traffic &amp; Demand
              </h3>
              <p className="text-xs text-dark-400 mb-6">Real-time slot utilization trend across the campus</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData.length ? dailyData : [{ _id: 'Today', count: 12, revenue: 480 }]}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2243" />
                    <XAxis dataKey="_id" stroke="#75799c" fontSize={12} />
                    <YAxis stroke="#75799c" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f1227', borderColor: '#2d3259', borderRadius: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Reservations"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="urlColorCount"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Vehicle Distribution */}
            <div className="glass-card p-6 border border-dark-600/40">
              <h3 className="text-base font-semibold text-white mb-1">Vehicle Split</h3>
              <p className="text-xs text-dark-400 mb-6">Distribution by vehicle category</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleData.length ? vehicleData : [{ name: 'CAR', value: 10 }, { name: 'EV', value: 4 }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(vehicleData.length ? vehicleData : [1, 2]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f1227', borderColor: '#2d3259', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Zone Usage Bar Chart */}
          <div className="glass-card p-6 border border-dark-600/40">
            <h3 className="text-base font-semibold text-white mb-1">Zone Load &amp; Revenue Balance</h3>
            <p className="text-xs text-dark-400 mb-6">Slot bookings per zone (A, B, C, D, E)</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData.length ? zoneData : [{ zone: 'Zone A', bookings: 24 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2243" />
                  <XAxis dataKey="zone" stroke="#75799c" fontSize={12} />
                  <YAxis stroke="#75799c" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f1227', borderColor: '#2d3259', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="bookings" name="Bookings" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: USERS MANAGEMENT ─── */}
      {viewTab === 'users' && (
        <div className="glass-card overflow-hidden border border-dark-600/40">
          <div className="p-4 border-b border-dark-700/50 flex justify-between items-center">
            <h3 className="font-semibold text-white text-base">Registered Users Directory</h3>
            <span className="text-xs text-dark-400">{users.length} Users Listed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900/60 text-dark-400 uppercase tracking-wider border-b border-dark-700/40">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30 text-dark-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-white">{u.name}</td>
                    <td className="p-3.5 text-dark-300">{u.email}</td>
                    <td className="p-3.5 font-mono text-neon-400">{u.vehicleNumber || '—'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        u.role === 'admin' ? 'bg-accent-500/20 text-accent-300' : 'bg-dark-700 text-dark-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        u.isActive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u._id)}
                          className="px-2.5 py-1 rounded text-[11px] font-medium border border-dark-600/40 hover:bg-dark-700/50 text-dark-300 hover:text-white"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: BOOKINGS OVERVIEW ─── */}
      {viewTab === 'bookings' && (
        <div className="glass-card overflow-hidden border border-dark-600/40">
          <div className="p-4 border-b border-dark-700/50 flex justify-between items-center">
            <h3 className="font-semibold text-white text-base">Platform Reservations Log</h3>
            <span className="text-xs text-dark-400">{bookings.length} Bookings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900/60 text-dark-400 uppercase tracking-wider border-b border-dark-700/40">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Slot</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30 text-dark-200">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-white">{b.user?.name || 'User'}</td>
                    <td className="p-3.5 font-mono text-neon-400">{b.slot?.slotNumber || '—'}</td>
                    <td className="p-3.5 font-mono">{b.vehicleNumber}</td>
                    <td className="p-3.5 text-dark-300">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-400">₹{b.totalAmount}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-dark-700 text-dark-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
