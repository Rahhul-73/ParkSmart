import { Link } from 'react-router-dom';
import { Car, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-600/40 flex items-center justify-center mb-6">
        <Car className="w-8 h-8 text-neon-400" />
      </div>
      <h1 className="text-6xl font-display font-extrabold text-white">404</h1>
      <p className="text-xl text-dark-300 mt-2 font-medium">Slot Not Found</p>
      <p className="text-xs text-dark-400 mt-1 max-w-sm">
        The destination you are navigating towards does not exist in our parking coordinates.
      </p>
      <Link to="/" className="btn-neon mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-xs">
        <ArrowLeft className="w-4 h-4 relative z-10" />
        <span>Return to Campus Entrance</span>
      </Link>
    </div>
  );
};

export default NotFound;
