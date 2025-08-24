import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { dwitter_backend } from 'declarations/dwitter_backend';

function AuthPage() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const navigate = useNavigate();

  // Predefined test users for multi-user environment
  const testUsers = [
    {
      id: 1,
      name: "Alice",
      principal: "2vxsx-faeaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaa",
      color: "#667eea"
    },
    {
      id: 2,
      name: "Bob",
      principal: "2vxsx-faeaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aab",
      color: "#764ba2"
    },
    {
      id: 3,
      name: "Charlie",
      principal: "2vxsx-faeaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aac",
      color: "#f093fb"
    },
    {
      id: 4,
      name: "Diana",
      principal: "2vxsx-faeaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aad",
      color: "#4facfe"
    },
    {
      id: 5,
      name: "Eve",
      principal: "2vxsx-faeaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aae",
      color: "#43e97b"
    }
  ];

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
      
      // For local development, show user selection
      if (process.env.DFX_NETWORK !== "ic") {
        setShowUserSelection(true);
        setIsLoading(false);
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

  const handleUserSelection = (user) => {
    setUserPrincipal({ toString: () => user.principal });
    setIsAuthenticated(true);
    
    // Store authentication state in localStorage
    localStorage.setItem('orbit_auth', JSON.stringify({
      principal: user.principal,
      userName: user.name,
      userColor: user.color,
      isAuthenticated: true,
      timestamp: Date.now()
    }));
    
    // Redirect to dashboard
    navigate('/dashboard');
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

  // User selection modal for local development
  if (showUserSelection) {
    return (
      <div className="auth-page">
        {/* Professional Header */}
        <header className="auth-header">
          <div className="auth-header-container">
            <div className="auth-header-left">
              <Link to="/" className="auth-logo">
                <span className="auth-logo-icon">🚀</span>
                <span className="auth-logo-text">Orbit</span>
              </Link>
            </div>
            <div className="auth-header-right">
              <Link to="/" className="auth-nav-link">Home</Link>
              <Link to="/dashboard" className="auth-nav-link">Dashboard</Link>
              <button 
                onClick={() => setShowUserSelection(false)}
                className="auth-back-btn"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <div className="auth-main">
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-card-header">
                <div className="auth-card-icon">👥</div>
                <h1>Choose Your Identity</h1>
                <p>Select a test user to simulate multi-user environment</p>
              </div>

              <div className="user-selection">
                <div className="user-grid">
                  {testUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="user-card"
                      onClick={() => handleUserSelection(user)}
                      style={{ borderColor: user.color }}
                    >
                      <div 
                        className="user-avatar"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <p className="user-principal">{formatPrincipal(user.principal)}</p>
                      </div>
                      <div className="user-select-arrow">→</div>
                    </div>
                  ))}
                </div>
                
                <div className="user-selection-info">
                  <p>
                    <strong>Multi-User Testing:</strong> Each user has a unique Principal ID. 
                    You can switch between users to test interactions between different identities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">
          <div className="auth-loading-spinner"></div>
          <h2>Setting up Orbit</h2>
          <p>Initializing secure authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Professional Header */}
      <header className="auth-header">
        <div className="auth-header-container">
          <div className="auth-header-left">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-icon">🚀</span>
              <span className="auth-logo-text">Orbit</span>
            </Link>
          </div>
          <div className="auth-header-right">
            <Link to="/" className="auth-nav-link">Home</Link>
            <Link to="/dashboard" className="auth-nav-link">Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="auth-card-icon">🔐</div>
              <h1>Welcome to Orbit</h1>
              <p>Sign in to join the global town square</p>
            </div>

            <div className="auth-content">
              <div className="auth-features">
                <div className="auth-feature">
                  <div className="auth-feature-icon">🌐</div>
                  <div className="auth-feature-content">
                    <h3>Decentralized Identity</h3>
                    <p>
                      {process.env.DFX_NETWORK === "ic" 
                        ? "Secure, privacy-preserving authentication without passwords or personal data collection."
                        : "Test with multiple users to simulate a real multi-user environment."
                      }
                    </p>
                  </div>
                </div>

                <div className="auth-feature">
                  <div className="auth-feature-icon">💬</div>
                  <div className="auth-feature-content">
                    <h3>Global Conversation</h3>
                    <p>Join the single, shared timeline where everyone sees the same unfiltered conversation.</p>
                  </div>
                </div>

                <div className="auth-feature">
                  <div className="auth-feature-icon">🛡️</div>
                  <div className="auth-feature-content">
                    <h3>Privacy First</h3>
                    <p>Your Principal ID is your anonymous blockchain identity - no personal data required.</p>
                  </div>
                </div>
              </div>

              <div className="auth-benefits">
                <div className="auth-benefit">
                  <span className="auth-benefit-icon">✓</span>
                  <span>No passwords required</span>
                </div>
                <div className="auth-benefit">
                  <span className="auth-benefit-icon">✓</span>
                  <span>Complete privacy</span>
                </div>
                <div className="auth-benefit">
                  <span className="auth-benefit-icon">✓</span>
                  <span>Blockchain-native identity</span>
                </div>
                {process.env.DFX_NETWORK !== "ic" && (
                  <div className="auth-benefit">
                    <span className="auth-benefit-icon">✓</span>
                    <span>Multi-user testing</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="auth-login-btn"
              >
                {isLoading ? (
                  <>
                    <div className="auth-spinner"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="auth-login-icon">🌐</span>
                    {process.env.DFX_NETWORK === "ic" 
                      ? "Sign in with Internet Identity"
                      : "Choose Test User"
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
                    className="auth-link"
                  >
                    Create one here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
