'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatEasternDate } from '../../../lib/time';

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  archived: boolean;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (postId: string, currentArchived: boolean) => {
    setArchiving(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archived: !currentArchived,
        }),
      });

      if (response.ok) {
        await fetchPosts();
      } else {
        const errorData = await response.json();
        alert(`Failed to ${currentArchived ? 'unarchive' : 'archive'} post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error archiving post:', error);
      alert(`Failed to ${currentArchived ? 'unarchive' : 'archive'} post. Please try again.`);
    } finally {
      setArchiving(null);
    }
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeleting(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the posts list to ensure we have the latest data
        await fetchPosts();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Filter posts based on selected filter
  const filteredPosts = posts.filter(post => {
    switch (filter) {
      case 'published':
        return post.published && !post.archived;
      case 'draft':
        return !post.published && !post.archived;
      case 'archived':
        return post.archived;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7A0000] to-[#A01010] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-white/80">
                <Link href="/admin" className="hover:text-white">Admin</Link>
                <span>›</span>
                <span className="text-white">Blog Posts</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Blog Posts</h1>
              <p className="text-white/90 mt-1">Manage your church blog posts</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
              >
                Back to Admin
              </Link>
              <Link
                href="/admin/posts/new"
                className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Blog Overview</h2>
              <p className="text-gray-600">Total posts: {posts.length}</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Published: {posts.filter(p => p.published && !p.archived).length}
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                Drafts: {posts.filter(p => !p.published && !p.archived).length}
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                Archived: {posts.filter(p => p.archived).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Posts</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({posts.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'published'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Published ({posts.filter(p => p.published && !p.archived).length})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'draft'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts ({posts.filter(p => !p.published && !p.archived).length})
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'archived'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Archived ({posts.filter(p => p.archived).length})
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Blog Posts' : 
               filter === 'published' ? 'Published Posts' :
               filter === 'draft' ? 'Draft Posts' : 'Archived Posts'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first blog post to share news and updates with your community</p>
                <Link
                  href="/admin/posts/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Post
                </Link>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                        {post.archived && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Archived
                          </span>
                        )}
                        {!post.published && !post.archived && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                        {post.published && !post.archived && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{post.author?.name || 'Church Staff'}</span>
                        <span>•</span>
                        <span>{formatEasternDate(post.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/blog/${post.id}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleArchive(post.id, post.archived)}
                        disabled={archiving === post.id}
                        className={`text-sm font-medium transition-colors ${
                          post.archived 
                            ? 'text-green-600 hover:text-green-700 disabled:text-green-400'
                            : 'text-orange-600 hover:text-orange-700 disabled:text-orange-400'
                        }`}
                      >
                        {archiving === post.id ? 'Processing...' : post.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="text-red-600 hover:text-red-700 disabled:text-red-400 text-sm font-medium"
                      >
                        {deleting === post.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}