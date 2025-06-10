import React, { useState, useEffect } from 'react';
import WordPressLikeService from './wordPressLikeService';
import { Heart, ThumbsUp, Smile, Frown, Angry, AlertCircle } from 'lucide-react';

const LikeReactionSystem = ({ postId, showReactions = true, showCounts = true, size = 'medium' }) => {
  const [stats, setStats] = useState({
    likes: 0,
    reactions: {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0
    },
    userLiked: false,
    userReaction: null
  });
  const [loading, setLoading] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [error, setError] = useState(null);

  const reactionConfig = {
    like: { icon: ThumbsUp, emoji: '👍', label: 'Like', color: '#3498db' },
    love: { icon: Heart, emoji: '❤️', label: 'Love', color: '#e74c3c' },
    laugh: { icon: Smile, emoji: '😂', label: 'Laugh', color: '#f39c12' },
    wow: { icon: AlertCircle, emoji: '😮', label: 'Wow', color: '#9b59b6' },
    sad: { icon: Frown, emoji: '😢', label: 'Sad', color: '#95a5a6' },
    angry: { icon: Angry, emoji: '😠', label: 'Angry', color: '#e67e22' }
  };

  const sizeConfig = {
    small: { iconSize: 16, spacing: 'gap-1', padding: 'p-1', text: 'text-xs' },
    medium: { iconSize: 20, spacing: 'gap-2', padding: 'p-2', text: 'text-sm' },
    large: { iconSize: 24, spacing: 'gap-3', padding: 'p-3', text: 'text-base' }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (postId) {
      loadStats();
    }
  }, [postId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const postStats = await WordPressLikeService.getPostStats(postId);
      setStats(postStats);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading like stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await WordPressLikeService.toggleLike(postId);
      
      // Update local state optimistically
      setStats(prev => ({
        ...prev,
        userLiked: result.liked,
        likes: typeof result.likesCount === 'number' ? result.likesCount : 
               (prev.likes + (result.liked ? 1 : -1))
      }));
      
      // Reload stats to get accurate counts
      setTimeout(loadStats, 500);
    } catch (err) {
      setError(err.message);
      console.error('Error toggling like:', err);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      setShowReactionPicker(false);
      
      const result = await WordPressLikeService.addReaction(postId, reactionType);
      
      // Update local state optimistically
      setStats(prev => ({
        ...prev,
        userReaction: result.reaction,
        reactions: result.reactionCounts || prev.reactions
      }));
      
      // Reload stats to get accurate counts
      setTimeout(loadStats, 500);
    } catch (err) {
      setError(err.message);
      console.error('Error adding reaction:', err);
    }
  };

  const getTotalReactions = () => {
    return Object.values(stats.reactions).reduce((sum, count) => sum + count, 0);
  };

  const getTopReactions = (limit = 3) => {
    return Object.entries(stats.reactions)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  const ReactionPicker = () => (
    <div className="reaction-picker">
      <div className="reaction-picker-content">
        {Object.entries(reactionConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            className={`reaction-option ${stats.userReaction === type ? 'selected' : ''}`}
            title={config.label}
            style={{ color: config.color }}
          >
            <span className="reaction-emoji">{config.emoji}</span>
            {showCounts && stats.reactions[type] > 0 && (
              <span className="reaction-count">{stats.reactions[type]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="like-reaction-system loading">
        <div className="loading-placeholder"></div>
      </div>
    );
  }

  return (
    <div className="like-reaction-system">
      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="engagement-container">
        {/* Like Button */}
        <div className="like-section">
          <button
            onClick={handleLike}
            className={`like-button ${stats.userLiked ? 'liked' : ''}`}
            title={stats.userLiked ? 'Unlike' : 'Like'}
          >
            <Heart 
              size={config.iconSize} 
              fill={stats.userLiked ? '#e74c3c' : 'none'}
              color={stats.userLiked ? '#e74c3c' : '#7f8c8d'}
            />
            {showCounts && stats.likes > 0 && (
              <span className="like-count">{stats.likes}</span>
            )}
          </button>
        </div>

        {/* Reactions Section */}
        {showReactions && (
          <div className="reactions-section">
            <div className="reaction-trigger-container">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="reaction-trigger"
                title="Add reaction"
              >
                {stats.userReaction ? (
                  <>
                    <span className="user-reaction-emoji">
                      {reactionConfig[stats.userReaction].emoji}
                    </span>
                    <span className="reaction-label">
                      {reactionConfig[stats.userReaction].label}
                    </span>
                  </>
                ) : (
                  <>
                    <Smile size={config.iconSize} color="#7f8c8d" />
                    <span className="reaction-label">React</span>
                  </>
                )}
              </button>

              {showReactionPicker && <ReactionPicker />}
            </div>

            {/* Reaction Summary */}
            {showCounts && getTotalReactions() > 0 && (
              <div className="reaction-summary">
                <div className="top-reactions">
                  {getTopReactions().map(([type, count]) => (
                    <span key={type} className="reaction-summary-item">
                      <span className="summary-emoji">{reactionConfig[type].emoji}</span>
                      <span className="summary-count">{count}</span>
                    </span>
                  ))}
                </div>
                
                {getTotalReactions() > 0 && (
                  <span className="total-reactions">
                    {getTotalReactions()} reaction{getTotalReactions() !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .like-reaction-system {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .like-reaction-system.loading {
          opacity: 0.6;
        }

        .loading-placeholder {
          width: 120px;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 16px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          padding: 0.5rem;
          font-size: 0.85rem;
          color: #c33;
        }

        .engagement-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .like-section {
          display: flex;
          align-items: center;
        }

        .like-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: ${config.padding.split('-')[1] === '1' ? '0.4rem 0.8rem' : 
                       config.padding.split('-')[1] === '2' ? '0.6rem 1rem' : '0.8rem 1.2rem'};
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: ${config.text === 'text-xs' ? '0.75rem' : 
                       config.text === 'text-sm' ? '0.875rem' : '1rem'};
          color: #2c3e50;
        }

        .like-button:hover {
          background: #f8f9fa;
          border-color: #dee2e6;
          transform: translateY(-1px);
        }

        .like-button.liked {
          border-color: #e74c3c;
          background: rgba(231, 76, 60, 0.1);
        }

        .like-count {
          font-weight: 500;
          color: inherit;
        }

        .reactions-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .reaction-trigger-container {
          position: relative;
        }

        .reaction-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: ${config.padding.split('-')[1] === '1' ? '0.4rem 0.8rem' : 
                       config.padding.split('-')[1] === '2' ? '0.6rem 1rem' : '0.8rem 1.2rem'};
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: ${config.text === 'text-xs' ? '0.75rem' : 
                       config.text === 'text-sm' ? '0.875rem' : '1rem'};
          color: #2c3e50;
        }

        .reaction-trigger:hover {
          background: #f8f9fa;
          border-color: #dee2e6;
          transform: translateY(-1px);
        }

        .user-reaction-emoji {
          font-size: ${config.iconSize}px;
        }

        .reaction-label {
          font-weight: 500;
        }

        .reaction-picker {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 0.5rem;
          z-index: 1000;
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .reaction-picker-content {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 25px;
          padding: 0.5rem;
          display: flex;
          gap: 0.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .reaction-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          border-radius: 12px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 40px;
        }

        .reaction-option:hover {
          background: #f8f9fa;
          transform: scale(1.1);
        }

        .reaction-option.selected {
          background: rgba(52, 152, 219, 0.1);
          border: 2px solid #3498db;
        }

        .reaction-emoji {
          font-size: 20px;
        }

        .reaction-count {
          font-size: 0.7rem;
          font-weight: 500;
          color: #666;
        }

        .reaction-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: ${config.text === 'text-xs' ? '0.75rem' : 
                       config.text === 'text-sm' ? '0.875rem' : '1rem'};
        }

        .top-reactions {
          display: flex;
          gap: 0.75rem;
        }

        .reaction-summary-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .summary-emoji {
          font-size: ${config.iconSize}px;
        }

        .summary-count {
          font-weight: 500;
          color: #2c3e50;
        }

        .total-reactions {
          color: #7f8c8d;
          font-size: 0.85em;
          white-space: nowrap;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .engagement-container {
            gap: 1rem;
          }

          .reaction-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .reaction-picker {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 0;
          }

          .reaction-picker-content {
            padding: 0.75rem;
            gap: 0.5rem;
          }

          .reaction-option {
            min-width: 50px;
            padding: 0.75rem;
          }

          .reaction-emoji {
            font-size: 24px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .like-button,
          .reaction-trigger {
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .like-button:hover,
          .reaction-trigger:hover {
            background: #2d3748;
            border-color: #718096;
          }

          .reaction-picker-content {
            background: #2d3748;
            border-color: #4a5568;
          }

          .reaction-option:hover {
            background: #4a5568;
          }

          .reaction-summary-item {
            background: #2d3748;
            border-color: #4a5568;
          }

          .summary-count {
            color: #e2e8f0;
          }

          .total-reactions {
            color: #a0aec0;
          }

          .error-message {
            background: #fed7d7;
            border-color: #feb2b2;
            color: #c53030;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .like-button,
          .reaction-trigger {
            border-width: 2px;
          }

          .reaction-picker-content {
            border-width: 2px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .like-button,
          .reaction-trigger,
          .reaction-option {
            transition: none;
          }

          .like-button:hover,
          .reaction-trigger:hover {
            transform: none;
          }

          .reaction-option:hover {
            transform: none;
          }

          .reaction-picker {
            animation: none;
          }

          .loading-placeholder {
            animation: none;
            background: #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
};

export default LikeReactionSystem;