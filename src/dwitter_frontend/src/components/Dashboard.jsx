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
  const [userName, setUserName] = useState(null);
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
        setUserName(authData.userName || null);
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
    } catch (err) {
      console.error('Failed to fetch dweets:', err);
      setError('Failed to fetch dweets: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDweet = async (e) => {
    e.preventDefault();
    if (!newDweet.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      await dwitter_backend.postDweet(newDweet);
      setNewDweet('');
      fetchDweets(); // Refresh the dweets
    } catch (err) {
      console.error('Failed to post dweet:', err);
      setError('Failed to post dweet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDweet = async (id) => {
    if (!editMessage.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      await dwitter_backend.editDweet(id, editMessage);
      setEditMessage('');
      setEditingDweet(null);
      fetchDweets(); // Refresh the dweets
    } catch (err) {
      console.error('Failed to edit dweet:', err);
      setError('Failed to edit dweet: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDweet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dweet?')) return;

    try {
      setIsLoading(true);
      setError('');
      await dwitter_backend.deleteDweet(id);
      fetchDweets(); // Refresh the dweets
    } catch (err) {
      console.error('Failed to delete dweet:', err);
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

  const handleLogout = async () => {
    try {
      if (authClient) {
        await authClient.logout();
      }
      localStorage.removeItem('orbit_auth');
      navigate('/auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const copyPrincipalToClipboard = () => {
    if (userPrincipal) {
      navigator.clipboard.writeText(userPrincipal.toString());
      // You could add a toast notification here
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
    return date.toLocaleString();
  };

  const formatPrincipal = (principal) => {
    const text = principal.toString();
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
  };

  const isOwnDweet = (dweet) => {
    if (!userPrincipal) return false;
    return dweet.author.toString() === userPrincipal.toString();
  };

  if (!userPrincipal) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <h1>Orbit</h1>
            <p>The Global Town Square</p>
          </div>
                      <div className="header-right">
              <div className="user-info">
                <span className="principal-container">
                  <span className="principal-label">
                    {userName ? `${userName}'s ID:` : 'Your ID:'}
                  </span>
                  <span className="principal-value">{formatPrincipal(userPrincipal)}</span>
                  <button onClick={copyPrincipalToClipboard} className="copy-btn" title="Copy Principal ID">
                    📋
                  </button>
                </span>
                <button onClick={handleLogout} className="nav-btn">
                  Sign Out
                </button>
              </div>
            </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Post Section */}
          <section className="post-section">
            <h2>Share Your Thoughts</h2>
            <form onSubmit={handlePostDweet} className="post-form">
              <textarea
                value={newDweet}
                onChange={(e) => setNewDweet(e.target.value)}
                placeholder="What's happening in the global town square? (max 280 characters)"
                maxLength={280}
                className="post-input"
                disabled={isLoading}
              />
              <div className="post-footer">
                <span className="char-count">{newDweet.length}/280</span>
                <button type="submit" className="post-btn" disabled={isLoading || !newDweet.trim()}>
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

          {/* Timeline Section */}
          <section className="timeline-section">
            <h2>Global Timeline</h2>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dweets...</p>
              </div>
            ) : dweets.length === 0 ? (
              <div className="empty-state">
                <p>No dweets yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="dweets-timeline">
                {dweets.map((dweet) => (
                  <div key={dweet.id} className="dweet-card">
                    <div className="dweet-header">
                      <Link to={`/profile/${dweet.author.toString()}`} className="author-link">
                        <span className="author-name">{formatPrincipal(dweet.author)}</span>
                      </Link>
                      <span className="dweet-timestamp">{formatTimestamp(dweet.timestamp)}</span>
                    </div>
                    <div className="dweet-content">
                      {editingDweet === dweet.id ? (
                        <div className="edit-form">
                          <textarea
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="edit-input"
                            maxLength={280}
                          />
                          <div className="edit-actions">
                            <button 
                              onClick={() => handleEditDweet(dweet.id)}
                              className="save-btn"
                              disabled={!editMessage.trim()}
                            >
                              Save
                            </button>
                            <button onClick={cancelEditing} className="cancel-btn">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="dweet-message">{dweet.message}</p>
                      )}
                    </div>
                    {isOwnDweet(dweet) && editingDweet !== dweet.id && (
                      <div className="dweet-actions">
                        <button onClick={() => startEditing(dweet)} className="action-btn" title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteDweet(dweet.id)} className="action-btn" title="Delete">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
