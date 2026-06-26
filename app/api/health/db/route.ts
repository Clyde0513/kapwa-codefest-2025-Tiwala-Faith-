import { supabaseDb } from '../../../../lib/supabase-db';

export const runtime = 'nodejs'; // Prisma requires Node runtime

export async function GET() {
  try {
    // Test database connection with a simple query
    await supabaseDb.$queryRaw`SELECT 1`;
    
    // Get counts one by one to avoid connection issues
    let users = 0, posts = 0, comments = 0, events = 0;
    
    try {
      users = await supabaseDb.user.count();
    } catch (e) {
      console.warn('Users count failed:', e);
    }
    
    try {
      posts = await supabaseDb.post.count();
    } catch (e) {
      console.warn('Posts count failed:', e);
    }
    
    try {
      comments = await supabaseDb.comment.count();
    } catch (e) {
      console.warn('Comments count failed:', e);
    }
    
    try {
      events = await supabaseDb.event.count();
    } catch (e) {
      console.warn('Events count failed:', e);
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        users, 
        posts, 
        comments, 
        events, 
        timestamp: new Date().toISOString() 
      }),
      { 
        status: 200, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  } catch (err: any) {
    console.error('Database health check error:', err);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: err.message ?? 'unknown error',
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}



