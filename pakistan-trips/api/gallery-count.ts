import type { VercelRequest, VercelResponse } from '@vercel/node';

const GALLERY_TAG = 'gallery';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) {
    return res.status(401).json({ error: 'Admin authentication is required.' });
  }

  const userResponse = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + token },
  });
  if (!userResponse.ok) return res.status(401).json({ error: 'Your admin session is invalid or expired.' });
  const user: any = await userResponse.json();
  const adminResponse = await fetch(
    supabaseUrl + '/rest/v1/tour_cms_admins?select=user_id&user_id=eq.' + encodeURIComponent(user.id),
    { headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + token } },
  );
  if (!adminResponse.ok) return res.status(403).json({ error: 'Could not verify admin permissions.' });
  const admins: any[] = await adminResponse.json();
  if (!admins.some((admin) => admin.user_id === user.id)) {
    return res.status(403).json({ error: 'Only authorized CMS admins can view the gallery count.' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ error: 'Cloudinary server credentials are not configured.' });
  }

  try {
    let count = 0;
    let nextCursor = '';
    do {
      const query = new URLSearchParams({ max_results: '500' });
      if (nextCursor) query.set('next_cursor', nextCursor);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${GALLERY_TAG}?${query.toString()}`,
        { headers: { Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64') } },
      );
      if (!response.ok) {
        const details: any = await response.json().catch(() => ({}));
        throw new Error(details.error?.message || 'Cloudinary could not return the live gallery count.');
      }
      const data: any = await response.json();
      count += Array.isArray(data.resources) ? data.resources.length : 0;
      nextCursor = data.next_cursor || '';
    } while (nextCursor);

    return res.status(200).json({ count, source: 'cloudinary-admin-api' });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Could not load the live Cloudinary gallery count.' });
  }
}
