import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dwitter_backend } from 'declarations/dwitter_backend';
import { Principal } from '@dfinity/principal';

function UserProfile() {
  const { principalId } = useParams();
  const [userDweets, setUserDweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [editingDweet, setEditingDweet] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const navigate = useNavigate();



  useEffect(() => {
    checkCurrentUser();
    fetchUserDweets();
  }, [principalId]);

  const checkCurrentUser = () => {
    const storedAuth = localStorage.getItem('orbit_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      const mockPrincipal = {
        toString: () => authData.principal,
        toText: () => authData.principal,
      };
      setUserPrincipal(mockPrincipal);
    }
  };

  const fetchUserDweets = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const principal = Principal.fromText(principalId);
      const dweets = await dwitter_backend.getDweetsByAuthor(principal);
      
      setUserDweets(dweets);
    } catch (err) {
      console.error('Failed to fetch user dweets:', err);
      
      // Fallback: try to get all dweets and filter
      try {
        console.log('Trying fallback method...');
        const allDweets = await dwitter_backend.getDweets();
        
        // Filter dweets by author
        const filteredDweets = allDweets.filter(dweet => {
          const dweetAuthor = dweet.author.toString();
          const targetPrincipal = principalId;
          return dweetAuthor === targetPrincipal;
        });
        
        setUserDweets(filteredDweets);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Failed to load dweets. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDweet = async (id) => {
    if (!editMessage.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      
      // Use the default actor for editing
      await dwitter_backend.editDweet(id, editMessage);
      setEditMessage('');
      setEditingDweet(null);
      fetchUserDweets(); // Refresh the dweets
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
      
      // Use the default actor for deleting
      await dwitter_backend.deleteDweet(id);
      fetchUserDweets(); // Refresh the dweets
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

  return (
    <div className="user-profile-page">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard" className="back-btn">
              ← Back to Timeline
            </Link>
            <div className="profile-info">
              <h1>Profile</h1>
              <div className="principal-info">
                <span className="principal-label">Principal ID:</span>
                <span className="principal-value">{formatPrincipal(principalId)}</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <Link to="/dashboard" className="nav-btn primary">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-label">Dweets</span>
                <span className="stat-value">{userDweets.length}</span>
              </div>
            </div>
          </div>

          <section className="user-dweets-section">
            <h2>Dweets by {formatPrincipal(principalId)}</h2>
            
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dweets...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                {error}
              </div>
            ) : userDweets.length === 0 ? (
              <div className="empty-state">
                <p>No dweets found for this user.</p>
              </div>
            ) : (
              <div className="dweets-timeline">
                {userDweets.map((dweet) => (
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

export default UserProfile;
