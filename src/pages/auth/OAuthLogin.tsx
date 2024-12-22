import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Handling OAuth callback');
      console.log('Current location:', location.pathname);
      console.log('Search params:', location.search);
      
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const redirect = searchParams.get('redirect');

      console.log('Parsed params:', { token: token?.substring(0, 20) + '...', error, redirect });

      if (error) {
        console.error('OAuth error:', error);
        setError(decodeURIComponent(error));
        return;
      }

      if (token) {
        try {
          setLoading(true);
          console.log('Logging in with token...');
          await login(token);
          console.log('Login successful, redirecting to:', redirect || '/dashboard');
          navigate(redirect || '/dashboard', { replace: true });
        } catch (err) {
          console.error('Login error:', err);
          setError(err instanceof Error ? err.message : 'Failed to complete authentication. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No token found in URL');
      }
    };

    if (location.pathname === '/auth/callback' || location.pathname === '/api/auth/google/callback') {
      handleCallback();
    }
  }, [location, login, navigate]);

  const handleGoogleLogin = () => {
    try {
      setLoading(true);
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } catch (err) {
      console.error('Failed to start OAuth flow:', err);
      setError('Failed to start authentication. Please try again.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => {
                setError(null);
                navigate('/login');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.367,1.333-1.08,2.493-2.052,3.465 c-2.738,2.738-7.178,2.738-9.916,0c-2.738-2.738-2.738-7.178,0-9.916c2.738-2.738,7.178-2.738,9.916,0 C16.891,8.562,17.479,9.62,17.824,10.756H12.545c-1.054,0-1.909,0.855-1.909,1.909"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthLogin; 