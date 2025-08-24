import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { dwitter_backend } from 'declarations/dwitter_backend';

function AuthPage() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPrincipal, setUserPrincipal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      // Check if we have stored authentication state
      const storedAuth = localStorage.getItem('orbit_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUserPrincipal({ toString: () => authData.principal });
        navigate('/dashboard');
        return;
      }
      
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      
      if (isAuthenticated) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        setUserPrincipal(principal);
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!authClient) return;

    try {
      setIsLoading(true);
      
      // For local development, use a mock authentication
      if (process.env.DFX_NETWORK !== "ic") {
        // Create a mock principal for local development
        const mockPrincipal = "dtvkx-nqfcs-gvi6k-g7ti5-rwaqi-dqhdd-mg6tw-nye7j-2fevm-htgnp-nqe";
        setUserPrincipal({ toString: () => mockPrincipal });
        setIsAuthenticated(true);
        
        // Store authentication state in localStorage
        localStorage.setItem('orbit_auth', JSON.stringify({
          principal: mockPrincipal,
          isAuthenticated: true,
          timestamp: Date.now()
        }));
        
        // Redirect immediately to dashboard
        navigate('/dashboard');
        return;
      }
      
      // Start the login process for mainnet
      await new Promise((resolve, reject) => {
        authClient.login({
          identityProvider: "https://identity.ic0.app",
          onSuccess: () => {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();
            setUserPrincipal(principal);
            setIsAuthenticated(true);
            resolve();
          },
          onError: reject,
        });
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setUserPrincipal(null);
      
      // Clear stored authentication state
      localStorage.removeItem('orbit_auth');
      
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatPrincipal = (principal) => {
    if (!principal) return '';
    const principalStr = principal.toString();
    return principalStr.slice(0, 8) + '...' + principalStr.slice(-8);
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-card">
            <div className="spinner"></div>
            <h3>Setting up Orbit</h3>
            <p>Initializing secure authentication...</p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="auth-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Orbit</h2>
          </div>
          <Link to="/" className="nav-btn secondary">Back to Home</Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome to Orbit</h1>
            <p>Sign in with Internet Identity to start posting dweets</p>
          </div>

          <div className="auth-content">
            <div className="auth-info">
              <div className="info-icon">🔐</div>
              <h3>Secure Authentication</h3>
              <p>
                {process.env.DFX_NETWORK === "ic" 
                  ? "Internet Identity provides secure, privacy-preserving authentication without passwords or personal data collection."
                  : "Local development mode: Using mock authentication for testing. In production, this will use Internet Identity."
                }
              </p>
            </div>

            <div className="auth-benefits">
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>No passwords required</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Complete privacy</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Blockchain-native identity</span>
              </div>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="login-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="login-icon">🌐</span>
                  {process.env.DFX_NETWORK === "ic" 
                    ? "Sign in with Internet Identity"
                    : "Sign in (Local Development)"
                  }
                </>
              )}
            </button>

            <div className="auth-footer">
              <p>
                Don't have an Internet Identity?{' '}
                <a 
                  href="https://identity.ic0.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link"
                >
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
