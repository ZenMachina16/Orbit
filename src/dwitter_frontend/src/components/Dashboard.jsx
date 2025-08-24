import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { dwitter_backend } from 'declarations/dwitter_backend';

function Dashboard() {
  const [dweets, setDweets] = useState([]);
  const [newDweet, setNewDweet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (userPrincipal) {
      fetchDweets();
    }
  }, [userPrincipal]);

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
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
      setDweets(fetchedDweets);
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
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatPrincipal = (principal) => {
    const principalStr = principal.toString();
    return principalStr.slice(0, 8) + '...' + principalStr.slice(-8);
  };

  if (!userPrincipal) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
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
              <span className="user-principal">{formatPrincipal(userPrincipal)}</span>
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
              <div className="empty-icon">📝</div>
              <h3>No dweets yet</h3>
              <p>Be the first to post a dweet and start the conversation!</p>
            </div>
          ) : (
            <div className="dweets-list">
              {dweets.map((dweet) => (
                <article key={dweet.id.toString()} className="dweet-card">
                  <div className="dweet-header">
                    <span className="author">{formatPrincipal(dweet.author)}</span>
                    <span className="timestamp">{formatTimestamp(dweet.timestamp)}</span>
                  </div>
                  <div className="dweet-content">
                    {dweet.message}
                  </div>
                  <div className="dweet-footer">
                    <span className="dweet-id">#{dweet.id.toString()}</span>
                    {dweet.author.toString() === userPrincipal.toString() && (
                      <span className="own-dweet">Your dweet</span>
                    )}
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
