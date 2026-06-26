import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '../../../../lib/supabase-db';

async function findMediaById(id: string) {
  const photo = await supabaseDb.photo.findUnique({
    where: { id },
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

  if (photo) {
    return { type: 'image' as const, data: photo };
  }

  const video = await supabaseDb.video.findUnique({
    where: { id },
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

  if (video) {
    return { type: 'video' as const, data: video };
  }

  return null;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const media = await findMediaById(id);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    if (media.type === 'image') {
      await supabaseDb.photo.delete({ where: { id } });
    } else {
      await supabaseDb.video.delete({ where: { id } });
    }

    console.log('Media deleted:', media.data.publicId, media.type);

    return NextResponse.json({ 
      ok: true, 
      message: 'Media deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}

// Update media metadata (caption, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existingMedia = await findMediaById(id);

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    const include = {
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
    };

    const updatedMedia =
      existingMedia.type === 'image'
        ? await supabaseDb.photo.update({
            where: { id },
            data: {
              caption: body.caption !== undefined ? body.caption : existingMedia.data.caption,
            },
            include,
          })
        : await supabaseDb.video.update({
            where: { id },
            data: {
              caption: body.caption !== undefined ? body.caption : existingMedia.data.caption,
            },
            include,
          });

    return NextResponse.json({ 
      ok: true, 
      media: {
        ...updatedMedia,
        mediaType: existingMedia.type,
      },
      photo: updatedMedia,
      video: updatedMedia,
    });

  } catch (error) {
    console.error('Error updating media:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid postId or uploaderId' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// Get single media item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const media = await findMediaById(id);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      media: {
        ...media.data,
        mediaType: media.type,
      },
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

