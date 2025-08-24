import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dwitter_backend } from 'declarations/dwitter_backend';
import { Principal } from '@dfinity/principal';

function UserProfile() {
  const { principalId } = useParams();
  const navigate = useNavigate();
  const [dweets, setDweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPrincipal, setUserPrincipal] = useState(null);

  useEffect(() => {
    fetchUserDweets();
    checkCurrentUser();
  }, [principalId]);

  const checkCurrentUser = () => {
    // Check if we have stored authentication state
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
      
      // Convert the principal ID string to a Principal object
      let authorPrincipal;
      try {
        authorPrincipal = Principal.fromText(principalId);
      } catch (err) {
        setError('Invalid principal ID format');
        setIsLoading(false);
        return;
      }
      
      console.log('Searching for dweets by principal:', authorPrincipal.toString());
      
      let fetchedDweets = [];
      try {
        fetchedDweets = await dwitter_backend.getDweetsByAuthor(authorPrincipal);
        console.log('Fetched dweets:', fetchedDweets);
      } catch (certError) {
        console.error('Certificate error, trying alternative approach:', certError);
        
        // If certificate verification fails, try to get all dweets and filter client-side
        try {
          const allDweets = await dwitter_backend.getDweets();
          console.log('All dweets fetched:', allDweets);
          
          // Filter dweets by author client-side
          fetchedDweets = allDweets.filter(dweet => {
            const dweetAuthor = dweet.author.toString();
            const searchAuthor = authorPrincipal.toString();
            console.log('Comparing:', dweetAuthor, 'with', searchAuthor);
            return dweetAuthor === searchAuthor;
          });
          console.log('Filtered dweets:', fetchedDweets);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw certError; // Re-throw original error
        }
      }
      
      // For local development, if we have a stored principal, 
      // treat dweets with anonymous principal as our own
      const storedAuth = localStorage.getItem('orbit_auth');
      if (storedAuth && process.env.DFX_NETWORK !== "ic") {
        const authData = JSON.parse(storedAuth);
        console.log('Stored auth principal:', authData.principal);
        
                 // If we're searching for our own principal but got no results,
         // try to find dweets with anonymous principals and treat them as ours
         if (fetchedDweets.length === 0 && authorPrincipal.toString() === authData.principal) {
           console.log('No dweets found for mock principal, looking for anonymous dweets...');
           
           // Get all dweets and find ones with anonymous principals
           try {
             const allDweets = await dwitter_backend.getDweets();
             console.log('All dweets for anonymous search:', allDweets);
             
             // Find dweets with anonymous principals (starting with 2vxsx)
             const anonymousDweets = allDweets.filter(dweet => 
               dweet.author.toString().startsWith('2vxsx')
             );
             console.log('Anonymous dweets found:', anonymousDweets);
             
             // Map them to show as our own
             const modifiedDweets = anonymousDweets.map(dweet => ({
               ...dweet,
               author: { toString: () => authData.principal }
             }));
             setDweets(modifiedDweets);
           } catch (err) {
             console.error('Error finding anonymous dweets:', err);
             setDweets(fetchedDweets);
           }
        } else {
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
        }
      } else {
        setDweets(fetchedDweets);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching user dweets:', err);
      if (err.message.includes('Certificate verification error')) {
        setError('Network error: Please try refreshing the page or use the deployed frontend URL');
      } else {
        setError('Failed to fetch user dweets: ' + err.message);
      }
    } finally {
      setIsLoading(false);
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

  const isOwnDweet = (dweetAuthor) => {
    if (!userPrincipal || !dweetAuthor) return false;
    
    const userPrincipalStr = userPrincipal.toString();
    const dweetAuthorStr = dweetAuthor.toString();
    
    return userPrincipalStr === dweetAuthorStr;
  };

  const handleEditDweet = async (dweetId, newMessage) => {
    try {
      setIsLoading(true);
      const result = await dwitter_backend.editDweet(dweetId, newMessage);
      
      if ('Ok' in result) {
        await fetchUserDweets();
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
        await fetchUserDweets();
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

  const [editingDweet, setEditingDweet] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const startEditing = (dweet) => {
    setEditingDweet(dweet.id);
    setEditMessage(dweet.message);
  };

  const cancelEditing = () => {
    setEditingDweet(null);
    setEditMessage('');
  };

  return (
    <div className="user-profile-page">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/dashboard" className="back-btn">
              ← Back to Dashboard
            </Link>
            <div className="profile-info">
              <h1>User Profile</h1>
              <div className="user-principal">
                <span className="principal-label">Principal ID:</span>
                <span className="principal-value">{formatPrincipal({ toString: () => principalId })}</span>
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
        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && dweets.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading user dweets...</p>
          </div>
        ) : dweets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No dweets found</h3>
            <p>This user hasn't posted any dweets yet.</p>
            <Link to="/dashboard" className="cta-btn primary">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="profile-content">
            <div className="profile-header">
              <h2>Dweets by {formatPrincipal({ toString: () => principalId })}</h2>
              <div className="profile-stats">
                <span className="stat">
                  <strong>{dweets.length}</strong> dweet{dweets.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="dweets-list">
              {dweets.map((dweet) => (
                <article key={dweet.id.toString()} className="dweet-card">
                  <div className="dweet-header">
                    <span className="author">{formatPrincipal(dweet.author)}</span>
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
                    {isOwnDweet(dweet.author) && (
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
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserProfile;
