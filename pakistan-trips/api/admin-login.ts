import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Best-effort per-instance throttling to reduce alert spam.
const recent = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const event = body?.event;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const recipient = (process.env.SECURITY_ALERT_EMAIL || 'abdulwahab.dev3@gmail.com').toLowerCase();
  if (!['failed', 'success'].includes(event) || !email) {
    return res.status(400).json({ error: 'Invalid alert request.' });
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() || 'Unavailable';
  const now = Date.now();
  const item = recent.get(ip);
  if (item && item.resetAt > now && item.count >= 5) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  if (!item || item.resetAt <= now) recent.set(ip, { count: 1, resetAt: now + 600000 });
  else recent.set(ip, { count: item.count + 1, resetAt: item.resetAt });

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // Successful alerts require a real Supabase session belonging to a listed CMS admin.
  if (event === 'success') {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!supabaseUrl || !supabaseKey || !token) return res.status(401).json({ error: 'Valid admin session required.' });
    const userResponse = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + token },
    });
    if (!userResponse.ok) return res.status(401).json({ error: 'Invalid session.' });
    const user: any = await userResponse.json();
    if ((user.email || '').toLowerCase() !== email) return res.status(403).json({ error: 'Session email mismatch.' });
    const adminResponse = await fetch(
      supabaseUrl + '/rest/v1/tour_cms_admins?select=user_id&user_id=eq.' + encodeURIComponent(user.id),
      { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + token } },
    );
    const admins: any[] = adminResponse.ok ? await adminResponse.json() : [];
    if (!admins.some((admin) => admin.user_id === user.id)) {
      return res.status(403).json({ error: 'This account is not an authorized CMS admin.' });
    }
  }

  const city = req.headers['x-vercel-ip-city']?.toString() || '';
  const country = req.headers['x-vercel-ip-country']?.toString() || '';
  const location = [city, country].filter(Boolean).join(', ') || 'Unavailable';
  const browser = req.headers['user-agent']?.toString() || 'Unavailable';
  const sender = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!sender || !appPassword) {
    console.error('Gmail alert environment variables missing: GMAIL_USER or GMAIL_APP_PASSWORD.');
    return res.status(503).json({ error: 'Gmail SMTP credentials are not configured in this deployment.' });
  }

  try {
    const mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: sender, pass: appPassword },
    });
    await mailer.sendMail({
      from: sender,
      to: recipient,
      subject: event === 'success' ? 'Admin login successful - My Pakistan Trips' : 'Failed admin login - My Pakistan Trips',
      text: [
        event === 'success'
          ? 'A successful CMS admin login was detected.'
          : 'A failed login attempt was made on the My Pakistan Trips admin login page.',
        'Time (UTC): ' + new Date().toISOString(),
        'Attempted account email: ' + email,
        'IP address: ' + ip,
        'Approximate location: ' + location,
        'Browser/device: ' + browser,
        '',
        'If this was not you, review your admin account security.',
      ].join('\n'),
    });
    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Admin security alert email failed:', error);
    return res.status(503).json({ error: 'Gmail rejected or could not send the alert. Check the App Password and Gmail account security.' });
  }
}
