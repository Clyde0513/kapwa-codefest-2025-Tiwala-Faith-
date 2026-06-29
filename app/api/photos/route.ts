import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db-utils';

// Create a new photo record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const { publicId, url, width, height, format, bytes } = body;
    
    if (!publicId || !url || !width || !height || !format || !bytes) {
      return NextResponse.json(
        { error: 'Missing required fields: publicId, url, width, height, format, bytes' },
        { status: 400 }
      );
    }

    // Create photo record in database
    const photo = await db.createPhoto({
      data: {
        publicId,
        url,
        width: parseInt(width),
        height: parseInt(height),
        format,
        bytes: parseInt(bytes),
        caption: body.caption || null,
        postId: body.postId || null,
        uploaderId: body.uploaderId || null,
        moderationStatus: body.moderationStatus === 'approved' ? 'approved' : 'pending',
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      ok: true, 
      photo 
    });

  } catch (error) {
    console.error('Error creating photo:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Photo with this public ID already exists' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid postId or uploaderId' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}

// Get all photos with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const uploaderId = searchParams.get('uploaderId');
    const moderationStatus = searchParams.get('moderationStatus');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (postId) {
      where.postId = postId;
    }
    
    if (uploaderId) {
      where.uploaderId = uploaderId;
    }

    if (moderationStatus === 'all') {
      // Admin view: no moderation filter.
    } else if (moderationStatus && ['pending', 'approved', 'rejected'].includes(moderationStatus)) {
      where.moderationStatus = moderationStatus;
    } else {
      where.moderationStatus = 'approved';
    }

    const photos = await db.findManyPhotos({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await db.countPhotos({ where }) as number;

    return NextResponse.json({
      ok: true,
      photos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
