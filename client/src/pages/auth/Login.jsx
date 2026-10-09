/**
 * Login Page (Login.jsx)
 * Uses React Hook Form + Zod validation, Framer Motion, and quick-fill demo buttons.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { loginSchema } from '../../schemas/validation';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
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

  const fillDemo = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@parksmart.io');
      setValue('password', 'admin123');
    } else {
      setValue('email', 'john@example.com');
      setValue('password', 'user123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 border border-dark-600/40 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white">Welcome Back</h1>
            <p className="text-sm text-dark-300 mt-2">
              Sign in to manage and reserve your parking slots
            </p>
          </div>

          {/* Demo account quick login helper */}
          <div className="mb-6 p-3 rounded-xl bg-dark-900/60 border border-dark-600/30">
            <p className="text-xs text-dark-400 mb-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-neon-400" />
              Quick demo auto-fill:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-accent-500/15 text-accent-300 border border-accent-500/30 hover:bg-accent-500/25 transition-colors"
              >
                Admin (admin@parksmart.io)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-neon-500/15 text-neon-300 border border-neon-500/30 hover:bg-neon-500/25 transition-colors"
              >
                User (john@example.com)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="input-glass pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="input-glass pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <LogIn className="w-4 h-4 relative z-10" />}
            </button>
          </form>

          <p className="text-center text-xs text-dark-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-neon-400 hover:text-neon-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
