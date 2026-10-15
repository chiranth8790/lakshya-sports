import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../library/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (roleData && roleData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // If logged in but not admin, sign them out from this context
          // so they don't get confused on the login page.
          await supabase.auth.signOut();
        }
      }
      setCheckingSession(false);
    }
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        throw authError;
      }

      if (data?.user) {
        // Check if user is an admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
          
        if (roleError && roleError.code !== 'PGRST116') {
          console.error("Role check error:", roleError);
        }

        if (roleData && roleData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // Not an admin
          await supabase.auth.signOut();
          setError("You do not have permission to access the admin portal.");
        }
      }
    } catch (err: any) {
      // Don't expose specific Supabase errors, give a generic safe message
      setError("Authentication failed. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-sm w-full border border-gray-200">
        <h1 className="text-2xl font-black uppercase mb-6 text-center">Admin Login</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-bold mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black disabled:opacity-50 disabled:bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black disabled:opacity-50 disabled:bg-gray-50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}