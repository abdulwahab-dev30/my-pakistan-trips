import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';

const GALLERY_TAG = 'gallery';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
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

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `public_ids=${publicIds.join(',')}&timestamp=${timestamp}`;
    const signature = createHash('sha1').update(paramsToSign + apiSecret).digest('hex');
    const form = new URLSearchParams();
    form.set('public_ids', publicIds.join(','));
    form.set('timestamp', timestamp);
    form.set('api_key', apiKey);
    form.set('signature', signature);

    const deleteResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const deleteData: any = await deleteResponse.json();
    if (!deleteResponse.ok) {
      return res.status(502).json({ error: deleteData.error?.message || 'Cloudinary could not delete the selected images.' });
    }
    const deleted = Object.entries(deleteData.deleted || {}).filter(([, status]) => status === 'deleted').map(([id]) => id);
    const failed = Object.entries(deleteData.deleted || {}).filter(([, status]) => status !== 'deleted').map(([id, status]) => ({ public_id: id, status }));
    return res.status(failed.length ? 207 : 200).json({ deleted, failed });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected error deleting gallery images.' });
  }
}
