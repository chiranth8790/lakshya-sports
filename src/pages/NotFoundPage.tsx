import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
        <Compass className="w-10 h-10 stroke-[2.2] animate-bounce" />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">404 Error</span>
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">
        Page Out of Bounds
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8">
        The equipment or page you are looking for has been moved, deleted, or is temporarily out of court.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
        <Link
          to="/category/rackets"
          className="flex items-center gap-2 border border-gray-300 hover:border-black text-gray-900 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Equipment
        </Link>
      </div>
    </div>
  );
}
