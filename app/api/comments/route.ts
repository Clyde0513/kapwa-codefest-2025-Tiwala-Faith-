import { supabaseDb } from '@/lib/supabase-db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET comments for a specific post
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const comments = await supabaseDb.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST new comment
export async function POST(req: NextRequest) {
  try {
    const { postId, content, authorEmail, parentId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json({ error: 'postId and content are required' }, { status: 400 });
    }

    // Verify post exists
    const post = await supabaseDb.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let authorId: string | undefined;
    if (authorEmail) {
      const user = await supabaseDb.user.upsert({
        where: { email: authorEmail },
        update: {},
        create: { email: authorEmail, name: 'Church Member' },
      });
      authorId = user.id;
    }

    const comment = await supabaseDb.comment.create({
      data: { 
        postId, 
        content, 
        authorId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}



