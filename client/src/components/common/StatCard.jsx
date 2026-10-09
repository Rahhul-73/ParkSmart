/**
 * Stat Card Component — Used in dashboards
 */
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = 'neon' }) => {
  const colors = {
    neon: { bg: 'from-neon-500/20 to-neon-600/5', border: 'border-neon-500/20', text: 'text-neon-400', icon: 'text-neon-500' },
    accent: { bg: 'from-accent-500/20 to-accent-600/5', border: 'border-accent-500/20', text: 'text-accent-400', icon: 'text-accent-500' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-500' },
    amber: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-500' },
  };

  const c = colors[color] || colors.neon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`glass-card p-6 border ${c.border} bg-gradient-to-br ${c.bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-dark-100">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center ${c.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
