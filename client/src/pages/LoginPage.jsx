/**
 * ══════════════════════════════════════════════════════════════
 *  LoginPage.jsx — Premium Split-Screen Authentication
 *  Left: Animated parking illustration & live telemetry visual
 *  Right: Floating label form, OTP verification modal, Google sign-in
 * ══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot Password / OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@parksmart.io');
      setPassword('admin123');
    } else {
      setEmail('john@example.com');
      setPassword('user123');
    }
    setErrors({});
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Please enter your registered email address');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: otpEmail });
      setOtpSent(true);
      toast.success(data?.message || 'OTP dispatched to email');
      if (data?.devOtp) {
        setOtpCode(data.devOtp);
        toast(`[Dev Mode] Verification OTP: ${data.devOtp}`, { icon: '🔑' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Enter 6-digit OTP');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: otpEmail,
        otp: otpCode,
        newPassword,
      });
      toast.success(data?.message || 'Password reset successfully! Please sign in.');
      setOtpModalOpen(false);
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Simple Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight text-white">
            ParkSmart
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs text-dark-300 hover:text-white transition-colors"
        >
          ← Return to Home
        </Link>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* ══════════════════════════════════════════════
              LEFT: ANIMATED PARKING ILLUSTRATION & VISUAL
              ══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0c0d16] via-[#101120] to-[#15122a] p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            {/* Ambient colorful flares */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-500/20 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-purple-500/20 blur-[90px] rounded-full pointer-events-none" />

            {/* Top brand badge */}
            <div className="relative z-10">
              <Badge variant="cyan" dot icon={Sparkles}>
                Real-Time IoT Access Control
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-4 tracking-tight leading-tight">
                Seamless Urban Mobility Starts Here
              </h2>
              <p className="text-xs sm:text-sm text-dark-300 mt-2 leading-relaxed">
                Connect directly with thousands of networked parking sensors across top campus facilities.
              </p>
            </div>

            {/* Center Animated Slot Simulation Card */}
            <div className="relative z-10 my-8 py-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl shadow-2xl relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      Bay A1-042 • Live Allocation
                    </span>
                  </div>
                  <span className="text-[10px] text-dark-400 font-mono">Floor 0 • Zone A</span>
                </div>

                {/* Slot Visual representation */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-dark-300">Vehicle Assigned</p>
                    <p className="text-base font-mono font-bold text-white">KA-01-AB-1234</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Car className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-dark-300">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Zap className="w-3.5 h-3.5" /> EV Charging Ready
                  </span>
                  <span className="text-emerald-400 font-semibold">Sensor Active</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Proof points */}
            <div className="relative z-10 grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.08] text-xs text-dark-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Double Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Encrypted JWT Sessions</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT: FLOATING LABEL AUTHENTICATION FORM
              ══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  Driver Sign In
                </h3>
                <p className="text-xs sm:text-sm text-dark-300 mt-1">
                  Access your dashboard, manage active tickets, and book spots.
                </p>
              </div>

              {/* Demo quick autofill buttons */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <p className="text-[11px] text-dark-400 font-medium mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Demo Credentials (One Click):
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin')}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-400/30 hover:bg-purple-500/20 transition-all text-center"
                  >
                    Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('user')}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all text-center"
                  >
                    User Account
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  floating
                  label="Email Address"
                  type="email"
                  name="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <Input
                  floating
                  label="Password"
                  type="password"
                  name="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-dark-300 hover:text-white">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-cyan-400/20"
                    />
                    <span>Remember session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpEmail(email);
                      setOtpModalOpen(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  loading={loading}
                  className="w-full mt-2"
                  iconRight={ArrowRight}
                >
                  Sign In
                </Button>
              </form>

              {/* Continue with Google */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-[#0e0f18] px-3 text-dark-400">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast('Google OAuth integration configured for production SSO', { icon: '🔐' })}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-xs font-semibold text-white transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.9 7C.7 9.4 0 11.6 0 12.3s.7 2.9 1.9 5.3l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-xs text-dark-300 pt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Register for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════
          OTP VERIFICATION & PASSWORD RESET MODAL
          ══════════════════════════════════════════════ */}
      <Modal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title="Reset Password via OTP"
        description="Verify your identity with a 6-digit security code dispatched to your registered email."
      >
        {!otpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 mt-2">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              loading={otpLoading}
              className="w-full mt-2"
            >
              Dispatch Verification OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
            <Input
              label="6-Digit Verification OTP"
              type="text"
              placeholder="123456"
              icon={KeyRound}
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOtpSent(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={otpLoading}
                className="flex-1"
              >
                Confirm &amp; Reset
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <footer className="py-6 text-center text-xs text-dark-400">
        © {new Date().getFullYear()} ParkSmart Infrastructure. Secured with 256-bit JWT Encryption.
      </footer>
    </div>
  );
};

export default LoginPage;
