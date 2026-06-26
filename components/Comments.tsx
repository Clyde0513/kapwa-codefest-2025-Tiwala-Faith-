'use client';

import { useState, useEffect } from 'react';
import { formatEasternDateTime } from '../lib/time';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  replies: Comment[];
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Please enter your comment');
      return;
    }

    if (!isAnonymous && !userEmail.trim()) {
      alert('Please enter your email address or select anonymous');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
          authorEmail: isAnonymous ? null : userEmail.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments(); // Refresh comments
      } else {
        const errorData = await response.json();
        alert(`Failed to post comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return `${formatEasternDateTime(dateString)} ET`;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#A85A52]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {comment.author?.name || 'Anonymous'}
            </span>
            <span className="text-gray-500 text-sm">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>
        <p className="text-gray-800 leading-relaxed">{comment.content}</p>
        
        {/* Like button for comment */}
        <div className="mt-3 flex items-center space-x-4">
          <CommentLikeButton 
            commentId={comment.id} 
            initialCount={0}
          />
          
          {!isReply && (
            <button
              onClick={() => {
                // Simple reply functionality - could be enhanced
                setNewComment(`@${comment.author?.name || 'Anonymous'} `);
                document.getElementById('comment-input')?.focus();
              }}
              className="text-sm text-[#A85A52] hover:text-[#8B4540] transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6">Comments ({comments.length})</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8 bg-white border-2 border-[#A85A52] rounded-lg p-6 shadow-md">
        <h4 className="text-lg font-medium mb-4 text-gray-900">Leave a Comment</h4>
        <div className="space-y-4">
          {/* Anonymous/Email toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment as:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="commentType"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="mr-2"
                />
                <span className="text-sm">Anonymous</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="commentType"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="mr-2"
                />
                <span className="text-sm">With my email</span>
              </label>
            </div>
          </div>

          {/* Email input - only show when not anonymous */}
          {!isAnonymous && (
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email Address *
              </label>
              <input
                id="user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A85A52] focus:border-transparent"
                required={!isAnonymous}
              />
            </div>
          )}
          <div>
            <label htmlFor="comment-input" className="block text-sm font-medium text-gray-700 mb-1">
              Your Comment *
            </label>
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A85A52] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-[#A85A52] to-[#8B4540] text-white px-6 py-2 rounded-md hover:from-[#8B4540] hover:to-[#A85A52] focus:outline-none focus:ring-2 focus:ring-[#A85A52] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}

// Like button component for comments
function CommentLikeButton({ 
  commentId, 
  initialCount 
}: { 
  commentId: string; 
  initialCount: number; 
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLike = async () => {
    let email = userEmail.trim();
    
    if (!email) {
      email = prompt('Please enter your email address to like this comment:') || '';
      if (!email.trim()) {
        return;
      }
      setUserEmail(email.trim());
      email = email.trim();
    }

    setLoading(true);
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          userEmail: email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setCount(data.count);
      } else {
        const errorData = await response.json();
        alert(`Failed to like comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      alert('Failed to like comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full transition-colors ${
        liked 
          ? 'bg-[#A85A52] bg-opacity-20 text-[#A85A52]' 
          : 'bg-gray-100 text-gray-600 hover:bg-[#A85A52] hover:bg-opacity-10 hover:text-[#A85A52]'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg 
        className="w-4 h-4" 
        fill={liked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
