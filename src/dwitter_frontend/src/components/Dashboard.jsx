import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { dwitter_backend } from 'declarations/dwitter_backend';

function Dashboard() {
  const [dweets, setDweets] = useState([]);
  const [newDweet, setNewDweet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [editingDweet, setEditingDweet] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (userPrincipal) {
      console.log('Dashboard: userPrincipal set to:', userPrincipal.toString());
      fetchDweets();
    }
  }, [userPrincipal]);

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      // Check if we have stored authentication state
      const storedAuth = localStorage.getItem('orbit_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        // Create a proper principal object that matches the backend format
        const mockPrincipal = {
          toString: () => authData.principal,
          toText: () => authData.principal,
          // Add other Principal methods that might be needed
        };
        setUserPrincipal(mockPrincipal);
        return;
      }
      
      const isAuthenticated = await client.isAuthenticated();
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      
      const identity = client.getIdentity();
      const principal = identity.getPrincipal();
      setUserPrincipal(principal);
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
      navigate('/auth');
    }
  };

  const fetchDweets = async () => {
    try {
      setIsLoading(true);
      const fetchedDweets = await dwitter_backend.getDweets();
      
      // For local development, if we have a stored principal, 
      // treat dweets with anonymous principal as our own
      const storedAuth = localStorage.getItem('orbit_auth');
      if (storedAuth && process.env.DFX_NETWORK !== "ic") {
        const authData = JSON.parse(storedAuth);
        const modifiedDweets = fetchedDweets.map(dweet => {
          // If it's an anonymous principal (starts with 2vxsx), treat it as our own
          if (dweet.author.toString().startsWith('2vxsx')) {
            return {
              ...dweet,
              author: { toString: () => authData.principal }
            };
          }
          return dweet;
        });
        setDweets(modifiedDweets);
      } else {
        setDweets(fetchedDweets);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch dweets: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newDweet.trim()) return;

    try {
      setIsLoading(true);
      const result = await dwitter_backend.postDweet(newDweet);
      
      if ('Ok' in result) {
        setNewDweet('');
        await fetchDweets();
        setError('');
      } else {
        setError('Failed to post dweet: ' + result.Err);
      }
    } catch (err) {
      setError('Failed to post dweet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      
      // Clear stored authentication state
      localStorage.removeItem('orbit_auth');
      
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEditDweet = async (dweetId, newMessage) => {
    try {
      setIsLoading(true);
      const result = await dwitter_backend.editDweet(dweetId, newMessage);
      
      if ('Ok' in result) {
        setEditingDweet(null);
        setEditMessage('');
        await fetchDweets();
        setError('');
      } else {
        setError('Failed to edit dweet: ' + result.Err);
      }
    } catch (err) {
      setError('Failed to edit dweet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDweet = async (dweetId) => {
    if (!window.confirm('Are you sure you want to delete this dweet? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await dwitter_backend.deleteDweet(dweetId);
      
      if ('Ok' in result) {
        await fetchDweets();
        setError('');
      } else {
        setError('Failed to delete dweet: ' + result.Err);
      }
    } catch (err) {
      setError('Failed to delete dweet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (dweet) => {
    setEditingDweet(dweet.id);
    setEditMessage(dweet.message);
  };

  const cancelEditing = () => {
    setEditingDweet(null);
    setEditMessage('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatPrincipal = (principal) => {
    const principalStr = principal.toString();
    return principalStr.slice(0, 8) + '...' + principalStr.slice(-8);
  };

  // Helper function to compare principals
  const isOwnDweet = (dweetAuthor) => {
    if (!userPrincipal || !dweetAuthor) return false;
    
    const userPrincipalStr = userPrincipal.toString();
    const dweetAuthorStr = dweetAuthor.toString();
    
    console.log('Comparing principals:', {
      userPrincipal: userPrincipalStr,
      dweetAuthor: dweetAuthorStr,
      match: userPrincipalStr === dweetAuthorStr
    });
    
    return userPrincipalStr === dweetAuthorStr;
  };

  const copyPrincipalToClipboard = async () => {
    try {
      const fullPrincipal = userPrincipal.toString();
      await navigator.clipboard.writeText(fullPrincipal);
      // You could add a toast notification here
      console.log('Principal copied to clipboard');
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  };

  if (!userPrincipal) {
    return (
      <div className="dashboard">
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner"></div>
            <h3>Initializing Orbit</h3>
            <p>Setting up your secure connection...</p>
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
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <h1>Orbit</h1>
            <span className="header-subtitle">Decentralized Microblogging</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-label">Logged in as:</span>
              <div className="principal-container">
                <span className="user-principal">{formatPrincipal(userPrincipal)}</span>
                <button 
                  onClick={copyPrincipalToClipboard}
                  className="copy-btn"
                  title="Copy Principal ID"
                >
                  📋
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Post Dweet Form */}
        <section className="post-section">
          <h2>Post a Dweet</h2>
          <form onSubmit={handleSubmit} className="dweet-form">
            <textarea
              value={newDweet}
              onChange={(e) => setNewDweet(e.target.value)}
              placeholder="What's happening? (max 280 characters)"
              maxLength={280}
              className="dweet-input"
              disabled={isLoading}
            />
            <div className="form-footer">
              <span className="char-count">{newDweet.length}/280</span>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading || !newDweet.trim()}
              >
                {isLoading ? 'Posting...' : 'Post Dweet'}
              </button>
            </div>
          </form>
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Success Message */}
        {!error && dweets.length > 0 && (
          <div className="error-message success">
            Timeline loaded successfully! {dweets.length} dweet{dweets.length !== 1 ? 's' : ''} found.
          </div>
        )}

        {/* Dweets Timeline */}
        <section className="timeline-section">
          <div className="timeline-header">
            <h2>Timeline</h2>
            <button 
              onClick={fetchDweets} 
              className="refresh-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {isLoading && dweets.length === 0 ? (
            <div className="loading">Loading dweets...</div>
          ) : dweets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚀</div>
              <h3>Welcome to Orbit!</h3>
              <p>You're the first one here! Post your first dweet to start the conversation.</p>
              <div className="empty-actions">
                <button 
                  onClick={() => document.querySelector('.dweet-input').focus()}
                  className="cta-btn primary"
                >
                  Write Your First Dweet
                </button>
              </div>
            </div>
          ) : (
            <div className="dweets-list">
              {dweets.map((dweet) => (
                <article key={dweet.id.toString()} className="dweet-card">
                  <div className="dweet-header">
                    <Link 
                      to={`/profile/${(() => {
                        // For local development, if this is an anonymous principal and we have stored auth,
                        // use the stored principal for the link
                        const storedAuth = localStorage.getItem('orbit_auth');
                        if (storedAuth && process.env.DFX_NETWORK !== "ic" && dweet.author.toString().startsWith('2vxsx')) {
                          const authData = JSON.parse(storedAuth);
                          return authData.principal;
                        }
                        return dweet.author.toString();
                      })()}`} 
                      className="author-link"
                    >
                      {formatPrincipal(dweet.author)}
                    </Link>
                    <span className="timestamp">{formatTimestamp(dweet.timestamp)}</span>
                  </div>
                  
                  {editingDweet === dweet.id ? (
                    <div className="edit-form">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        placeholder="Edit your dweet..."
                        maxLength={280}
                        className="edit-input"
                        disabled={isLoading}
                      />
                      <div className="edit-actions">
                        <span className="char-count">{editMessage.length}/280</span>
                        <div className="edit-buttons">
                          <button
                            onClick={() => handleEditDweet(dweet.id, editMessage)}
                            className="save-btn"
                            disabled={isLoading || !editMessage.trim()}
                          >
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="cancel-btn"
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="dweet-content">
                      {dweet.message}
                    </div>
                  )}
                  
                  <div className="dweet-footer">
                    <span className="dweet-id">#{dweet.id.toString()}</span>
                    {(() => {
                      const isOwn = isOwnDweet(dweet.author);
                      console.log(`Dweet ${dweet.id}: isOwnDweet = ${isOwn}`);
                      return isOwn ? (
                        <div className="dweet-actions">
                          <span className="own-dweet">Your dweet</span>
                          <button
                            onClick={() => startEditing(dweet)}
                            className="action-btn edit-btn"
                            disabled={isLoading}
                            title="Edit dweet"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteDweet(dweet.id)}
                            className="action-btn delete-btn"
                            disabled={isLoading}
                            title="Delete dweet"
                          >
                            🗑️
                          </button>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
