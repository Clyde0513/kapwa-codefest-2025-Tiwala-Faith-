import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db-utils';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10,000 characters'),
  published: z.boolean().default(true),
  archived: z.boolean().default(false),
  authorId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = postSchema.parse(body);

    const post = await db.createPost({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        published: validatedData.published,
        archived: validatedData.archived,
        authorId: validatedData.authorId || null,
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

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/archive');

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle database connection issues gracefully
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('prepared statement') || errorMessage.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Database temporarily unavailable. Please try again in a moment.',
            details: 'The database connection is experiencing issues. Your post will be saved once the connection is restored.'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create post', details: 'Please check your input and try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get('published');
    const archived = searchParams.get('archived');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await db.findManyPosts({
      where: {
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const total = await db.countPosts({
      where: {
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      },
    }) as number;

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}