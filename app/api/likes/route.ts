import { supabaseDb } from '@/lib/supabase-db';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST to like/unlike a post or comment
export async function POST(req: NextRequest) {
  try {
    const { postId, commentId, userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Either postId or commentId is required' }, { status: 400 });
    }

    if (postId && commentId) {
      return NextResponse.json({ error: 'Cannot like both post and comment simultaneously' }, { status: 400 });
    }

    // Find or create user
    const user = await supabaseDb.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail, name: 'Church Member' },
    });

    // Check if like already exists
    const existingLike = await supabaseDb.like.findUnique({
      where: {
        userId_postId: postId ? { userId: user.id, postId } : undefined,
        userId_commentId: commentId ? { userId: user.id, commentId } : undefined,
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await supabaseDb.like.delete({
        where: { id: existingLike.id },
      });

      // Get updated count
      const count = await supabaseDb.like.count({
        where: postId ? { postId } : { commentId },
      });

      return NextResponse.json({ 
        liked: false, 
        count,
        message: 'Unliked successfully' 
      });
    } else {
      // Like - create new like
      await supabaseDb.like.create({
        data: {
          userId: user.id,
          postId: postId || null,
          commentId: commentId || null,
        },
      });

      // Get updated count
      const count = await supabaseDb.like.count({
        where: postId ? { postId } : { commentId },
      });

      return NextResponse.json({ 
        liked: true, 
        count,
        message: 'Liked successfully' 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

// GET like status for a post or comment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Either postId or commentId is required' }, { status: 400 });
    }

    if (postId && commentId) {
      return NextResponse.json({ error: 'Cannot check like status for both post and comment simultaneously' }, { status: 400 });
    }

    // Find user
    const user = await supabaseDb.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ liked: false, count: 0 });
    }

    // Check if user has liked
    const existingLike = await supabaseDb.like.findUnique({
      where: {
        userId_postId: postId ? { userId: user.id, postId } : undefined,
        userId_commentId: commentId ? { userId: user.id, commentId } : undefined,
      },
    });

    // Get total count
    const count = await supabaseDb.like.count({
      where: postId ? { postId } : { commentId },
    });

    return NextResponse.json({ 
      liked: !!existingLike, 
      count 
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}



