/**
 * ══════════════════════════════════════════════════════════════
 *  Footer Component (Design System)
 *  SaaS-style layout, SDG badges, quick navigation & newsletter
 * ══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Heart, Shield, Globe, Leaf, Zap, ArrowUpRight } from 'lucide-react';
import Badge from './Badge';

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07070b] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute left-1/4 -bottom-24 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-1/4 -bottom-24 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-extrabold tracking-tight text-white">
                ParkSmart
              </span>
            </Link>
            <p className="text-sm text-dark-300 max-w-sm leading-relaxed">
              Intelligent slot reservation platform engineered to eradicate urban cruising,
              streamline commuter transit, and curtail greenhouse emissions.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="emerald" dot icon={Globe}>
                SDG 11: Sustainable Cities
              </Badge>
              <Badge variant="cyan" dot icon={Leaf}>
                SDG 13: Climate Action
              </Badge>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs text-dark-300">
              <li>
                <Link to="/parking" className="hover:text-cyan-400 transition-colors">
                  Live Slot Map
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors">
                  Smart Amenities
                </a>
              </li>
              <li>
                <a href="#sdg-impact" className="hover:text-cyan-400 transition-colors">
                  Carbon Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Access</h4>
            <ul className="space-y-2 text-xs text-dark-300">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">
                  Driver Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  Register Vehicle
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Active Tickets
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-purple-400 transition-colors flex items-center gap-1">
                  Operator Console <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & CEP */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Coursework Mapping</h4>
            <ul className="space-y-1.5 text-[11px] text-dark-400">
              <li>• PO2 / PO3: Problem &amp; Architecture Design</li>
              <li>• PO5: MERN, Vite, Tailwind &amp; Framer</li>
              <li>• PO6 / PO11: Society Safety &amp; PM Metrics</li>
              <li>• PSO1 / PSO2: Production Quality Standard</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark-400">
          <p>© {new Date().getFullYear()} ParkSmart Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-1 text-dark-400">
            Engineered with <Heart className="w-3 h-3 text-rose-500 mx-1 fill-rose-500" /> for Web Technologies CEP
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
