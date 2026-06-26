import Header from '../components/Header';
import { supabaseDb } from '../../lib/supabase-db';
import Link from 'next/link';
import { formatEasternDate } from '../../lib/time';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  let archivedPosts: any[] = [];

  try {
    // Fetch archived posts from database
    archivedPosts = await supabaseDb.post.findMany({
      where: {
        published: true,
        archived: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching archived posts:', error);
    archivedPosts = [];
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#faecc8' }}>
      <Header />

      <section className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-poppins mb-4 text-gray-900">Archive</h1>
          <p className="text-lg text-gray-700 mb-6">
            Explore our collection of archived posts from previous church activities and events.
          </p>
          <div className="flex items-center space-x-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-[#A85A52] hover:text-[#8B4540] transition-colors"
            >
              ← Back to Current Posts
            </Link>
          </div>
        </div>
        
        {archivedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No archived posts yet</h3>
            <p className="text-gray-600">Archived posts will appear here when they are moved from the main blog.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {archivedPosts.map((post) => {
              const createdAt = new Date(post.createdAt);
              const hasValidCreatedAt = !Number.isNaN(createdAt.getTime());

              return (
              <article key={post.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400 opacity-90">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        <Link 
                          href={`/blog/${post.id}`}
                          className="hover:text-[#A85A52] transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Archived
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{post.author?.name || 'Church Staff'}</span>
                      <span>•</span>
                      {hasValidCreatedAt ? (
                        <time dateTime={createdAt.toISOString()}>
                          {formatEasternDate(createdAt)}
                        </time>
                      ) : (
                        <span>Unknown date</span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {post.content.length > 300 
                        ? `${post.content.substring(0, 300)}...` 
                        : post.content}
                    </p>
                    
                    {/* Interaction counts */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mt-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>0 likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>0 comments</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.id}`}
                      className="inline-block mt-3 text-[#A85A52] hover:text-[#8B4540] font-medium transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            )})}
          </div>
        )}
      </section>
    </main>
  )
}



