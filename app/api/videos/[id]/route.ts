import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '../../../../lib/supabase-db';

// Delete video (soft delete - removes from Cloudinary and marks as deleted in DB)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get video record
    const video = await supabaseDb.video.findUnique({
      where: { id },
      select: { id: true, publicId: true, postId: true },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // TODO: Call Cloudinary API to delete the resource
    // This would require server-side Cloudinary SDK
    // const cloudinary = require('cloudinary').v2;
    // await cloudinary.uploader.destroy(video.publicId);

    // For now, just delete from database
    // In production, you might want to soft delete instead
    await supabaseDb.video.delete({
      where: { id },
    });

    console.log('Video deleted:', video.publicId);

    return NextResponse.json({ 
      ok: true, 
      message: 'Video deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}

// Get single video
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      video 
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// Update video metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Only allow updating certain fields
    const allowedFields = ['caption'];
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const video = await supabaseDb.video.update({
      where: { id },
      data: updateData,
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
      video 
    });

  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}


