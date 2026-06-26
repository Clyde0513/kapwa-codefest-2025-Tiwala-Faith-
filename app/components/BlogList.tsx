import { fetchPosts } from '../../lib/supabase-content-client'
import Link from 'next/link'

export default async function BlogList({ limit }: { limit?: number }) {
  const posts: any[] = await fetchPosts()
  const list = typeof limit === 'number' ? posts.slice(0, limit) : posts

  return (
    <div className="grid gap-6">
      {list.map((post) => (
        <article key={post.slug} className="bg-white shadow-sm rounded-md p-6">
          <h3 className="text-2xl font-poppins mb-2">
            <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
          </h3>
          <p className="text-sm text-gray-600 mb-4">{post.publishedAt?.slice(0,10)} • {post.authorName}</p>
          <p className="text-gray-800">{post.excerpt || (post.previewText ? (post.previewText.length > 220 ? post.previewText.slice(0,220) + '...' : post.previewText) : '')}</p>
        </article>
      ))}
    </div>
  )
}

