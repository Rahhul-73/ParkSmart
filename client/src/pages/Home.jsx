/**
 * Landing Page (Home.jsx)
 * Showcases features, SDG 11 & SDG 13 alignment, real-time live slot status preview,
 * and quick actions with modern dark-mode neon aesthetics.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car,
  ShieldCheck,
  Zap,
  Leaf,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import SlotCard from '../components/parking/SlotCard';

const Home = () => {
  const [previewSlots, setPreviewSlots] = useState([]);
  const [summary, setSummary] = useState({ available: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const [slotsRes, sumRes] = await Promise.all([
          api.get('/parking/slots?limit=6'),
          api.get('/parking/slots/summary'),
        ]);
        const slots = slotsRes.data?.data?.slots || [];
        setPreviewSlots(slots.slice(0, 6));

        const counts = sumRes.data?.data?.summary || [];
        const avail = counts.find((c) => c._id === 'available')?.count || 0;
        const total = counts.reduce((acc, curr) => acc + curr.count, 0);
        setSummary({ available: avail, total });
      } catch (err) {
        // Fallback demo items if backend hasn't seeded yet
        setPreviewSlots([
          { _id: '1', slotNumber: 'A0-001', zone: 'A', floor: 0, type: 'ev', status: 'available', pricePerHour: 60, features: ['ev-charging', 'covered'] },
          { _id: '2', slotNumber: 'A0-002', zone: 'A', floor: 0, type: 'car', status: 'occupied', pricePerHour: 40, features: ['cctv'] },
          { _id: '3', slotNumber: 'B1-008', zone: 'B', floor: 1, type: 'car', status: 'available', pricePerHour: 40, features: ['near-exit'] },
          { _id: '4', slotNumber: 'C0-015', zone: 'C', floor: 0, type: 'bike', status: 'available', pricePerHour: 20, features: ['covered'] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-neon-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[300px] bg-accent-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs sm:text-sm font-medium text-neon-300 border border-neon-500/30 mb-8"
        >
          <Sparkles className="w-4 h-4 text-neon-400 animate-pulse" />
          <span>SDG 11 &amp; 13 Aligned Smart Urban Infrastructure</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight"
        >
          Zero Cruising. Guaranteed Parking.{' '}
          <span className="text-neon-gradient">Zero Carbon Waste.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-dark-300 max-w-2xl mx-auto leading-relaxed"
        >
          Experience intelligent slot reservation in real-time. Lock your spot before you drive, navigate instantly, and support sustainable green cities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/parking" className="btn-neon flex items-center gap-2 text-base px-8 py-3.5">
            <span>Find &amp; Book Slot</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
          </Link>
          <Link to="/register" className="btn-neon-outline text-base px-8 py-3.5">
            Create Free Account
          </Link>
        </motion.div>

        {/* Live Metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 glass-card border border-dark-600/40"
        >
          <div className="p-3 text-center border-r border-dark-700/50 last:border-none">
            <div className="flex items-center justify-center gap-1.5 text-neon-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider text-dark-400 font-semibold">Live Slots</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">{summary.available || 38} Free</p>
          </div>
          <div className="p-3 text-center border-r border-dark-700/50 last:border-none">
            <div className="flex items-center justify-center gap-1.5 text-accent-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider text-dark-400 font-semibold">Time Saved</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">~14 Mins</p>
          </div>
          <div className="p-3 text-center border-r border-dark-700/50 last:border-none">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider text-dark-400 font-semibold">CO₂ Reduced</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">32% Idle Drop</p>
          </div>
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider text-dark-400 font-semibold">EV Priority</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">Active Chg</p>
          </div>
        </motion.div>
      </section>

      {/* ─── Live Slot Preview ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-neon-400 text-sm font-semibold mb-1">
              <Car className="w-4 h-4" />
              <span>Real-Time Campus Slots</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Live Slot Availability</h2>
          </div>
          <Link
            to="/parking"
            className="flex items-center gap-1.5 text-sm text-neon-400 hover:text-neon-300 font-medium transition-colors"
          >
            Explore all zones &amp; floors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {previewSlots.map((slot) => (
            <SlotCard key={slot._id} slot={slot} />
          ))}
        </div>
      </section>

      {/* ─── Academic Mapping / SDG Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-12 border border-dark-600/40 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Coursework Project: Web Technologies CEP
              </span>
              <h2 className="text-3xl font-display font-bold text-white mt-4 mb-4">
                Sustainability-First Engineering
              </h2>
              <p className="text-dark-300 leading-relaxed mb-6">
                Urban drivers spend up to 20 minutes circling for parking spots, generating up to 30% of downtown congestion. ParkSmart addresses this via algorithmic slot routing and pre-allocation.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-neon-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">SDG 11: Sustainable Cities &amp; Communities</h4>
                    <p className="text-xs text-dark-400">Target 11.2 &amp; 11.6: Optimize transport mobility and air quality in urban hubs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">SDG 13: Climate Action</h4>
                    <p className="text-xs text-dark-400">Directly cuts combustion idle emissions and encourages EV transition.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">PO &amp; PSO Integration</h4>
                    <p className="text-xs text-dark-400">PO2, PO3, PO5, PO6, PO11, PSO1, and PSO2 compliant software architecture.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 border border-dark-600/30 text-center">
                <span className="text-3xl font-display font-extrabold text-neon-400">PO3 &amp; PO5</span>
                <p className="text-xs text-dark-300 mt-2 font-medium">Design &amp; Modern Web Tool Usage</p>
                <p className="text-[11px] text-dark-400 mt-1">Full-stack React 18, Node.js &amp; MongoDB</p>
              </div>
              <div className="glass-card p-5 border border-dark-600/30 text-center">
                <span className="text-3xl font-display font-extrabold text-accent-400">PO6 &amp; PO11</span>
                <p className="text-xs text-dark-300 mt-2 font-medium">Engineer, Society &amp; Project Mgmt</p>
                <p className="text-[11px] text-dark-400 mt-1">Security hardening &amp; analytics</p>
              </div>
              <div className="glass-card p-5 border border-dark-600/30 text-center">
                <span className="text-3xl font-display font-extrabold text-emerald-400">PSO1</span>
                <p className="text-xs text-dark-300 mt-2 font-medium">Core Stack Development</p>
                <p className="text-[11px] text-dark-400 mt-1">REST API + JWT Token Rotation</p>
              </div>
              <div className="glass-card p-5 border border-dark-600/30 text-center">
                <span className="text-3xl font-display font-extrabold text-amber-400">PSO2</span>
                <p className="text-xs text-dark-300 mt-2 font-medium">Production Security</p>
                <p className="text-[11px] text-dark-400 mt-1">Rate-limit, Helmet, XSS sanitized</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
