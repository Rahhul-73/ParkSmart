/**
 * Footer Component
 */
import { Car, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-dark-600/30 bg-dark-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-500 to-accent-600 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-display font-semibold text-neon-gradient">
              ParkSmart
            </span>
          </div>

          <p className="text-xs text-dark-400 text-center">
            SDG 11 — Sustainable Cities &amp; Communities | SDG 13 — Climate Action
          </p>

          <div className="flex items-center gap-1 text-xs text-dark-500">
            Built with <Heart className="w-3 h-3 text-red-500 mx-1" /> for Web Technologies CEP
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
