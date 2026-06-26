import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db-utils';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const mediaUrlSchema = z
  .string()
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('/api/media/proxy') ||
      value.startsWith('/images/') ||
      /^https?:\/\//.test(value),
    'Invalid image URL'
  )
  .optional();

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5,000 characters').optional(),
  startsAt: z.string().datetime('Invalid start date'),
  endsAt: z.string().datetime('Invalid end date'),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  imageUrl: mediaUrlSchema,
  allDay: z.boolean().default(false),
  createdById: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = eventSchema.parse(body);

    const event = await db.createEvent({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        startsAt: new Date(validatedData.startsAt),
        endsAt: new Date(validatedData.endsAt),
        location: validatedData.location || null,
        imageUrl: validatedData.imageUrl || null,
        allDay: validatedData.allDay,
        createdById: validatedData.createdById || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath('/');
    revalidatePath('/calendar');

    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get('upcoming');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {};
    
    if (upcoming === 'true') {
      whereClause.startsAt = {
        gte: new Date(),
      };
    }

    const events = await db.findManyEvents({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { startsAt: 'asc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await db.countEvents({
      where: whereClause,
    }) as number;

    return NextResponse.json({
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}