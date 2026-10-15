import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function RouteErrorBoundary() {
  const error: any = useRouteError();
  console.error('Route error caught:', error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
          Something Went Wrong
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          {error?.statusText || error?.message || 'An unexpected error occurred while loading this page.'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Page
          </button>
          <Link
            to="/"
            className="flex-1 border border-gray-300 hover:border-black text-gray-900 font-bold h-11 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
