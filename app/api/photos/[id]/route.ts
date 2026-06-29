import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '../../../../lib/supabase-db';

// Delete photo (soft delete - removes from Cloudinary and marks as deleted in DB)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get photo record
    const photo = await supabaseDb.photo.findUnique({
      where: { id },
      select: { id: true, publicId: true, postId: true },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // TODO: Call Cloudinary API to delete the resource
    // This would require server-side Cloudinary SDK
    // const cloudinary = require('cloudinary').v2;
    // await cloudinary.uploader.destroy(photo.publicId);

    // For now, just delete from database
    // In production, you might want to soft delete instead
    await supabaseDb.photo.delete({
      where: { id },
    });

    console.log('Photo deleted:', photo.publicId);

    return NextResponse.json({ 
      ok: true, 
      message: 'Photo deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

// Get single photo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      photo 
    });

  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}

// Update photo metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Only allow updating certain fields
    const allowedFields = ['caption', 'moderationStatus'];
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );

    if (
      updateData.moderationStatus &&
      !['pending', 'approved', 'rejected'].includes(String(updateData.moderationStatus))
    ) {
      return NextResponse.json(
        { error: 'Invalid moderation status' },
        { status: 400 }
      );
    }

    if (updateData.moderationStatus) {
      updateData.moderatedAt = new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const photo = await supabaseDb.photo.update({
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
      photo 
    });

  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}


