/**
 * Profile Page (Profile.jsx)
 * View and update user details, vehicle registration, and preferences.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Phone, Car, Save, Shield } from 'lucide-react';
import { profileSchema } from '../../schemas/validation';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      vehicleNumber: user?.vehicleNumber || '',
      vehicleType: user?.vehicleType || 'car',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', data);
      updateUser(res.data?.data?.user);
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-dark-600/40"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-dark-700/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-500 to-accent-600 flex items-center justify-center text-white text-2xl font-bold shadow-neon-cyan">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
            <p className="text-sm text-dark-400">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-500/15 text-accent-300 border border-accent-500/30">
              <Shield className="w-3 h-3" />
              <span className="uppercase">{user?.role} Access</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  {...register('name')}
                  className="input-glass pl-10"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-glass pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Vehicle License Plate</label>
              <div className="relative">
                <Car className="w-4 h-4 text-dark-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  {...register('vehicleNumber')}
                  className="input-glass pl-10 font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Vehicle Category</label>
              <select {...register('vehicleType')} className="input-glass">
                <option value="car" className="bg-dark-900">Car / Sedan / SUV</option>
                <option value="bike" className="bg-dark-900">Two-Wheeler / Bike</option>
                <option value="ev" className="bg-dark-900">Electric Vehicle (EV)</option>
                <option value="truck" className="bg-dark-900">Truck / Heavy</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-700/40 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-neon px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4 relative z-10" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
