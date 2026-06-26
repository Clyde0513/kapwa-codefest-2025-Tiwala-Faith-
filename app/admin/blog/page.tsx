import Link from 'next/link';
import { supabaseContentClient } from '../../../lib/supabase-content-client';

export default async function BlogManagementPage() {
  // Fetch blog posts from Sanity
  let sanityPosts: any[] = [];
  let totalPosts = 0;

  try {
    sanityPosts = await supabaseContentClient.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        "authorName": author->name,
        "mainImage": mainImage.asset->url
      }
    `);
    totalPosts = sanityPosts.length;
  } catch (error) {
    console.error('Error fetching Sanity posts:', error);
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
                <span className="text-white">Blog Management</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Blog Management</h1>
              <p className="text-white/90 mt-1">Create and manage your church blog posts</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
              >
                Back to Admin
              </Link>
              <Link
                href="https://b4h3ckxo.sanity.studio/"
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
              <p className="text-gray-600">Total posts: {totalPosts}</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Published: {sanityPosts.filter(p => p.publishedAt).length}
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                Drafts: {sanityPosts.filter(p => !p.publishedAt).length}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900">How to Create Blog Posts</h3>
              <div className="mt-2 text-blue-800">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click &quot;Create New Post&quot; button above to open the blog editor</li>
                  <li>Add a title, write your content, and upload images</li>
                  <li>Add an excerpt (short summary) for the blog listing</li>
                  <li>Choose to publish immediately or save as draft</li>
                  <li>Your post will appear on the website automatically</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Blog Posts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sanityPosts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first blog post to share news and updates with your community</p>
                <Link
                  href="https://b4h3ckxo.sanity.studio/"
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Post
                </Link>
              </div>
            ) : (
              sanityPosts.map((post) => (
                <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                        {!post.publishedAt && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {post.excerpt || 'No excerpt available'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{post.authorName || 'Church Staff'}</span>
                        <span>•</span>
                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}</span>
                        <span>•</span>
                        <span>Slug: {post.slug.current}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`https://b4h3ckxo.sanity.studio/desk/post;${post._id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/blog/${post.slug.current}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                  {post.mainImage && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.mainImage}
                        alt={post.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

