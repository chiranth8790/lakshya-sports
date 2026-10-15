import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../library/supabase';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session && mounted) {
          setSession(session);
          
          // Verify admin role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          if (roleError && roleError.code !== 'PGRST116') {
            console.error('Error checking user role:', roleError);
          }
            
          if (roleData && roleData.role === 'admin') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else if (mounted) {
          setSession(null);
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error during auth check:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setLoading(true);
        if (session) {
          setSession(session);
          // Check role again on auth state change
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
            
          if (roleData && roleData.role === 'admin') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setSession(null);
          setIsAuthorized(false);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Checking Authorization...</p>
        </div>
      </div>
    );
  }

  // If no session or not an admin, redirect to login
  if (!session || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // Render children (the Admin component)
  return <>{children}</>;
}
