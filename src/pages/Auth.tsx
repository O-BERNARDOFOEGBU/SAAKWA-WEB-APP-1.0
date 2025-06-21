
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">Saakwa</span> Laundry
          </h1>
          <p className="text-gray-600">Premium laundry service from Osapa to VI, Marina & Heart of Lekki</p>
        </div>
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};

export default Auth;
