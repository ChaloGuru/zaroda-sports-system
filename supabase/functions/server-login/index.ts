// Example Supabase Edge Function (Deno) for server-side admin login
// Deploy as a Supabase Edge Function. It expects environment variables:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// The function fetches the admin by username using the service role key and
// verifies the provided password using bcrypt (Deno bcrypt module).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import * as bcrypt from "https://deno.land/x/bcrypt@0.4.1/mod.ts";

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const { username, password } = await req.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, password_hash, email')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }

    const hash = admin.password_hash || '';

    // Detect bcrypt hash format (starts with $2a$, $2b$, $2y$)
    const isBcrypt = hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
    let match = false;

    if (isBcrypt) {
      match = await bcrypt.compare(password, hash);
    } else {
      // Legacy plain-text fallback: direct compare
      match = password === hash;
      // If it matches, migrate to bcrypt hash (best-effort)
      if (match) {
        try {
          const newHash = await bcrypt.hash(password);
          await supabase.from('admins').update({ password_hash: newHash }).eq('id', admin.id);
        } catch (e) {
          console.warn('Failed to migrate plain-text password to bcrypt hash', e);
        }
      }
    }

    if (!match) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }

    // Success: return safe admin info (do not return password_hash)
    const safe = { id: admin.id, username: admin.username, email: admin.email };

    // Optionally you can mint a custom JWT here and return it to client.
    return new Response(JSON.stringify({ success: true, admin: safe }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    console.error('Edge function error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
});
