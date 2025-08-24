import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      
      // Start the login process
      await new Promise((resolve, reject) => {
        authClient.login({
          identityProvider: process.env.DFX_NETWORK === "ic" 
            ? "https://identity.ic0.app" 
            : `http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
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

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && userPrincipal) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <h2>Welcome to Orbit!</h2>
            <p>You're successfully authenticated with Internet Identity.</p>
            <div className="user-info">
              <strong>Principal ID:</strong> {formatPrincipal(userPrincipal)}
            </div>
            <div className="auth-actions">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="auth-btn primary"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={handleLogout} 
                className="auth-btn secondary"
              >
                Logout
              </button>
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
                Internet Identity provides secure, privacy-preserving authentication 
                without passwords or personal data collection.
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
                  Sign in with Internet Identity
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
