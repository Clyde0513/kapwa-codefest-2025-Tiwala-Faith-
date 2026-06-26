import { supabaseDb } from '../../../lib/supabase-db';
import Link from 'next/link';
import PostInteractions from '../../../components/PostInteractions';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  
  let post: any = null;
  
  try {
    // Fetch post from database by ID with comment and like counts
    post = await supabaseDb.post.findUnique({
      where: { 
        id: id,
        published: true 
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
  }

  if (!post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#faecc8' }}>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <h1 className="text-4xl font-poppins mb-4 text-gray-900">Post not found</h1>
            <p className="text-gray-600 mb-6">The post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link 
              href="/blog" 
              className="inline-block bg-gradient-to-r from-[#A85A52] to-[#8B4540] text-white px-6 py-2 rounded-lg hover:from-[#8B4540] hover:to-[#A85A52] transition-all duration-300"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#faecc8' }}>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <article className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#A85A52]">
          <h1 className="text-4xl font-poppins mb-4 text-gray-900">{post.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
            <span>•</span>
            <span>By {post.author?.name || 'Church Staff'}</span>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {post.content}
            </div>
          </div>
        </article>
        
        {/* Post interactions - likes and comments */}
        <PostInteractions 
          postId={post.id} 
          initialLikeCount={0}
          initialCommentCount={0}
        />
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link 
            href="/blog" 
            className="inline-block bg-gradient-to-r from-[#A85A52] to-[#8B4540] text-white px-6 py-2 rounded-lg hover:from-[#8B4540] hover:to-[#A85A52] transition-all duration-300"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    </main>
  );
}


