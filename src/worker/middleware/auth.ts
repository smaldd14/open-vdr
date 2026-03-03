import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import '../types/hono';
import type { User } from '@/types';
import type { Database } from '@/types/supabase';

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authorization = c.req.header('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing authorization header' }, 401);
  }

  const token = authorization.slice(7);

  const supabase = createClient<Database>(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: { Authorization: authorization }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authUser) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  const user: User = {
    id: authUser.id,
    email: authUser.email ?? '',
    name: authUser.user_metadata?.name ?? '',
    createdAt: authUser.created_at,
  };

  c.set('user', user);

  await next();
}

export async function requireRoomMember(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  if (!user || !roomId) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  const supabase = createClient<Database>(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: { Authorization: c.req.header('Authorization')! }
      },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );

  const { data: membership } = await supabase
    .from('data_room_members')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return c.json({ success: false, error: 'Not a member of this room' }, 403);
  }

  c.set('roomId', roomId);

  await next();
}

export async function requireRoomAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  if (!user || !roomId) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }

  const supabase = createClient<Database>(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: { Authorization: c.req.header('Authorization')! }
      },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );

  const { data: membership } = await supabase
    .from('data_room_members')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single();

  if (!membership || membership.role !== 'admin') {
    return c.json({ success: false, error: 'Admin access required' }, 403);
  }

  c.set('roomId', roomId);

  await next();
}
