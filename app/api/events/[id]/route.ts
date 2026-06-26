import { supabaseDb } from '@/lib/supabase-db';

export const runtime = 'nodejs';

// GET /api/events/[id] - Get a single event by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const event = await supabaseDb.event.findUnique({
      where: { id },
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

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    return Response.json(event);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// PATCH /api/events/[id] - Update an event
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, startsAt, endsAt, allDay, location, description, url, gcalEventId, gcalCalendarId } = body;

    // Check if event exists
    const existingEvent = await supabaseDb.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt);
    if (endsAt !== undefined) updateData.endsAt = new Date(endsAt);
    if (allDay !== undefined) updateData.allDay = Boolean(allDay);
    if (location !== undefined) updateData.location = location;
    if (url !== undefined) updateData.url = url;
    if (gcalEventId !== undefined) updateData.gcalEventId = gcalEventId;
    if (gcalCalendarId !== undefined) updateData.gcalCalendarId = gcalCalendarId;

    const updatedEvent = await supabaseDb.event.update({
      where: { id },
      data: updateData,
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

    return Response.json(updatedEvent);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if event exists
    const existingEvent = await supabaseDb.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    await supabaseDb.event.delete({
      where: { id },
    });

    return Response.json({ message: 'Event deleted successfully', id });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}


