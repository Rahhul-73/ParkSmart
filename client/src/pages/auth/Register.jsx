/**
 * Register Page (Register.jsx)
 * Form for new users with vehicle profile registration and Zod validation.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Car, ArrowRight } from 'lucide-react';
import { registerSchema } from '../../schemas/validation';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      vehicleType: 'car',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        vehicleNumber: data.vehicleNumber,
        vehicleType: data.vehicleType,
      });
      navigate('/dashboard');
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card p-8 border border-dark-600/40">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
            <p className="text-sm text-dark-300 mt-2">
              Join ParkSmart for smart, effortless slot reservations
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className="input-glass pl-10"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className="input-glass pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">Password</label>
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

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="input-glass pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    {...register('phone')}
                    className="input-glass pl-10"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1">Vehicle Plate No.</label>
                <div className="relative">
                  <Car className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="KA-01-AB-1234"
                    {...register('vehicleNumber')}
                    className="input-glass pl-10 uppercase"
                  />
                </div>
                {errors.vehicleNumber && (
                  <p className="text-xs text-red-400 mt-1">{errors.vehicleNumber.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Vehicle Type</label>
              <select {...register('vehicleType')} className="input-glass">
                <option value="car" className="bg-dark-900">Car / Sedan / SUV</option>
                <option value="bike" className="bg-dark-900">Two-Wheeler / Bike</option>
                <option value="ev" className="bg-dark-900">Electric Vehicle (EV Charging)</option>
                <option value="truck" className="bg-dark-900">Truck / Heavy Vehicle</option>
              </select>
              {errors.vehicleType && (
                <p className="text-xs text-red-400 mt-1">{errors.vehicleType.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
              {!loading && <ArrowRight className="w-4 h-4 relative z-10" />}
            </button>
          </form>

          <p className="text-center text-xs text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-400 hover:text-neon-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
