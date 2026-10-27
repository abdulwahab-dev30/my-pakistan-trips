import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

const GALLERY_TAG = 'gallery';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization || '';\n  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';\n  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;\n  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;\n  if (!token || !supabaseUrl || !supabaseAnonKey) {\n    return res.status(401).json({ error: 'Admin authentication is required. Configure Supabase URL and anon key on the server.' });\n  }\n  const userResponse = await fetch(supabaseUrl + '/auth/v1/user', { headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + token } });\n  if (!userResponse.ok) return res.status(401).json({ error: 'Your admin session is invalid or expired. Sign in again.' });\n  const user: any = await userResponse.json();\n  const adminResponse = await fetch(supabaseUrl + '/rest/v1/tour_cms_admins?select=user_id&user_id=eq.' + encodeURIComponent(user.id), { headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + token } });\n  if (!adminResponse.ok) return res.status(403).json({ error: 'Could not verify admin permissions.' });\n  const admins: any[] = await adminResponse.json();\n  if (!admins.some((admin) => admin.user_id === user.id)) return res.status(403).json({ error: 'Only authorized CMS admins can delete gallery images.' });\n\n  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ error: 'Cloudinary server credentials are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to Vercel server environment variables.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const ids: unknown = body?.public_ids;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some((id) => typeof id !== 'string' || !id.trim() || id.length > 255)) {
    return res.status(400).json({ error: 'Provide between 1 and 100 valid image IDs.' });
  }

  try {
    // Verify each requested asset currently carries the fixed gallery tag before allowing deletion.
    const resourcesResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${GALLERY_TAG}?max_results=500`, {
      headers: { Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64') },
    });
    if (!resourcesResponse.ok) {
      return res.status(502).json({ error: 'Could not verify gallery images in Cloudinary.' });
    }
    const resourcesData: any = await resourcesResponse.json();
    const galleryIds = new Set<string>((resourcesData.resources || []).map((resource: any) => resource.public_id));
    const publicIds = [...new Set(ids as string[])];
    const invalidIds = publicIds.filter((id) => !galleryIds.has(id));
    if (invalidIds.length) {
      return res.status(400).json({ error: 'Some selected images are not found under the gallery tag. Refresh the gallery and try again.', invalid_ids: invalidIds });
    }

    const deleted: string[] = [];
    const failed: { public_id: string; status: string }[] = [];
    for (const publicId of publicIds) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}` + apiSecret).digest('hex');
      const form = new URLSearchParams();
      form.set('public_id', publicId);
      form.set('timestamp', timestamp);
      form.set('api_key', apiKey);
      form.set('signature', signature);
      const deleteResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const deleteData: any = await deleteResponse.json();
      if (deleteResponse.ok && deleteData.result === 'ok') deleted.push(publicId);
      else failed.push({ public_id: publicId, status: deleteData.error?.message || deleteData.result || 'failed' });
    }
    return res.status(failed.length ? 207 : 200).json({ deleted, failed });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected error deleting gallery images.' });
  }
}
