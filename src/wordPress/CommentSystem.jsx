import React, { useState, useEffect } from 'react';
import WordPressCommentService from '../wordPress/wordPressCommentService';
import WordPressAuthService from '../wordPress/wordPressAuthService';
import { MessageCircle, Reply, Edit2, Trash2, Send, User } from 'lucide-react';

const CommentSystem = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  const isAuthenticated = WordPressAuthService.isAuthenticated();
  const currentUser = WordPressAuthService.getCurrentUser();

  useEffect(() => {
    if (postId) {
      loadComments();
      loadCommentStats();
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await WordPressCommentService.getComments(postId);
      const threadedComments = WordPressCommentService.organizeCommentsThreaded(response.comments);
      setComments(threadedComments);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentStats = async () => {
    try {
      const commentStats = await WordPressCommentService.getCommentStats(postId);
      setStats(commentStats);
    } catch (err) {
      console.error('Error loading comment stats:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        postId,
        content: newComment,
        parentId: replyingTo?.id || 0,
      };

      // Add guest info if not authenticated
      if (!isAuthenticated) {
        commentData.authorName = guestInfo.name;
        commentData.authorEmail = guestInfo.email;
        commentData.authorUrl = guestInfo.url;
      }

      await WordPressCommentService.createComment(commentData);
      
      // Reset form
      setNewComment('');
      setReplyingTo(null);
      setGuestInfo({ name: '', email: '', url: '' });
      
      // Reload comments
      await loadComments();
      await loadCommentStats();
      
    } catch (err) {
      setError(err.message);
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await WordPressCommentService.updateComment(commentId, newContent);
      setEditingComment(null);
      await loadComments();
    } catch (err) {
      setError(err.message);
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await WordPressCommentService.deleteComment(commentId);
      await loadComments();
      await loadCommentStats();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.rawContent);
    const canEdit = WordPressCommentService.canEditComment(comment);

    const handleEdit = async () => {
      if (editContent.trim() === comment.rawContent) {
        setIsEditing(false);
        return;
      }

      try {
        await handleEditComment(comment.id, editContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error in edit:', err);
      }
    };

    return (
      <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="comment-content">
          <div className="comment-header">
            <div className="comment-author">
              <img 
                src={comment.author.avatar} 
                alt={comment.author.name}
                className="comment-avatar"
              />
              <div className="comment-author-info">
                <span className="comment-author-name">{comment.author.name}</span>
                <span className="comment-date">{formatDate(comment.date)}</span>
              </div>
            </div>
            
            {canEdit && (
              <div className="comment-actions">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="comment-action-btn edit-btn"
                  title="Edit comment"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="comment-action-btn delete-btn"
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="comment-body">
            {isEditing ? (
              <div className="edit-comment-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="edit-comment-textarea"
                  rows={3}
                />
                <div className="edit-comment-actions">
                  <button onClick={handleEdit} className="save-edit-btn">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="cancel-edit-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="comment-text"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}
          </div>

          <div className="comment-footer">
            <button 
              onClick={() => setReplyingTo(comment)}
              className="reply-btn"
            >
              <Reply size={14} />
              Reply
            </button>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="comment-system loading">
        <div className="loading-spinner"></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="comment-system">
      <div className="comments-header">
        <h3 className="comments-title">
          <MessageCircle size={20} />
          Comments ({stats.total})
        </h3>
      </div>

      {error && (
        <div className="comment-error">
          <p>{error}</p>
          <button onClick={loadComments} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Comment Form */}
      <div className="comment-form-container">
        {replyingTo && (
          <div className="replying-to">
            <p>Replying to <strong>{replyingTo.author.name}</strong></p>
            <button 
              onClick={() => setReplyingTo(null)}
              className="cancel-reply-btn"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitComment} className="comment-form">
          {!isAuthenticated && (
            <div className="guest-info">
              <div className="guest-info-row">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                  className="guest-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                  className="guest-input"
                  required
                />
              </div>
              <input
                type="url"
                placeholder="Your Website (optional)"
                value={guestInfo.url}
                onChange={(e) => setGuestInfo({...guestInfo, url: e.target.value})}
                className="guest-input"
              />
            </div>
          )}

          <div className="comment-input-container">
            {isAuthenticated && currentUser && (
              <div className="authenticated-user">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.displayName}
                  className="user-avatar"
                />
                <span className="user-name">{currentUser.displayName}</span>
              </div>
            )}
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.author.name}...` : "Write a comment..."}
              className="comment-textarea"
              rows={4}
              required
            />
          </div>

          <div className="comment-form-actions">
            <button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              className="submit-comment-btn"
            >
              {submitting ? (
                <>Posting...</>
              ) : (
                <>
                  <Send size={16} />
                  {replyingTo ? 'Post Reply' : 'Post Comment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      <style jsx>{`
        .comment-system {
          max-width: 740px;
          margin: 2rem 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .comment-system.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          color: #666;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .comments-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .comments-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .comment-error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #c33;
        }

        .retry-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .comment-form-container {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #e9ecef;
        }

        .replying-to {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #e3f2fd;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #1976d2;
        }

        .cancel-reply-btn {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          font-size: 0.85rem;
          text-decoration: underline;
        }

        .guest-info {
          margin-bottom: 1rem;
        }

        .guest-info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .guest-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .guest-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .comment-input-container {
          margin-bottom: 1rem;
        }

        .authenticated-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #555;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 500;
        }

        .comment-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .comment-form-actions {
          display: flex;
          justify-content: flex-end;
        }

        .submit-comment-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
        }

        .submit-comment-btn:hover:not(:disabled) {
          background: #2980b9;
        }

        .submit-comment-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .no-comments {
          text-align: center;
          padding: 3rem 1rem;
          color: #7f8c8d;
        }

        .no-comments svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .comment-item {
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .comment-reply {
          border-left: 3px solid #3498db;
          background: #f8f9fa;
        }

        .comment-content {
          padding: 1.25rem;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-author-info {
          display: flex;
          flex-direction: column;
        }

        .comment-author-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.95rem;
        }

        .comment-date {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .comment-actions {
          display: flex;
          gap: 0.5rem;
        }

        .comment-action-btn {
          background: none;
          border: none;
          padding: 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          color: #7f8c8d;
          transition: all 0.2s;
        }

        .comment-action-btn:hover {
          background: #f1f2f6;
          color: #2c3e50;
        }

        .delete-btn:hover {
          color: #e74c3c;
          background: #fee;
        }

        .comment-body {
          margin-bottom: 1rem;
        }

        .comment-text {
          line-height: 1.6;
          color: #2c3e50;
        }

        .edit-comment-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .edit-comment-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }

        .edit-comment-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-edit-btn,
        .cancel-edit-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .save-edit-btn {
          background: #27ae60;
          color: white;
        }

        .cancel-edit-btn {
          background: #95a5a6;
          color: white;
        }

        .comment-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .reply-btn {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .reply-btn:hover {
          background: #e3f2fd;
        }

        .comment-replies {
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        @media (max-width: 768px) {
          .comment-system {
            margin: 1rem 0;
          }

          .comment-form-container {
            padding: 1rem;
          }

          .guest-info-row {
            grid-template-columns: 1fr;
          }

          .comment-content {
            padding: 1rem;
          }

          .comment-author {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .comment-header {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CommentSystem;