import Link from 'next/link';
import { supabaseDb } from '../../lib/supabase-db';

interface DatabaseBlogListProps {
  limit?: number;
}

export default async function DatabaseBlogList({ limit }: DatabaseBlogListProps) {
  let posts: any[] = [];

  try {
    const result = await supabaseDb.post.findMany({
      where: { published: true },
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
    posts = result;
  } catch (error) {
    console.error('Error fetching posts from database:', error);
    // Continue with empty array
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">Check back soon for updates from our church community!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <article key={post.id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-[#A85A52]">
          <h3 className="text-2xl font-poppins mb-2">
            <Link href={`/blog/${post.id}`} className="hover:text-[#A85A52] transition-colors">
              {post.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {new Date(post.createdAt).toLocaleDateString()} • {post.author?.name || 'Church Admin'}
          </p>
          <p className="text-gray-800 mb-4">
            {post.content.length > 220 
              ? `${post.content.substring(0, 220)}...` 
              : post.content}
          </p>
          
          {/* Interaction counts */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
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
            <Link 
              href={`/blog/${post.id}`}
              className="text-[#A85A52] hover:text-[#8B4540] font-medium transition-colors"
            >
              Read more →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}



