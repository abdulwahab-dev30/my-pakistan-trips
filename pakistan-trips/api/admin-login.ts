import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 5;

function getRequestDetails(req: VercelRequest) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim()
    || req.headers['x-real-ip']?.toString()
    || 'Unavailable';
  const city = req.headers['x-vercel-ip-city']?.toString();
  const country = req.headers['x-vercel-ip-country']?.toString();
  const location = [city, country].filter(Boolean).join(', ') || 'Unavailable';
  return { ip, location, userAgent: req.headers['user-agent']?.toString() || 'Unavailable' };
}

async function sendAlert(subject: string, lines: string[]) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.SECURITY_ALERT_EMAIL || 'abdulwahab.dev3@gmail.com';
  if (!user || !pass) throw new Error('Gmail SMTP credentials are not configured.');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: user,
    to: recipient,
    subject,
    text: lines.join('\n'),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const alertEmail = (process.env.SECURITY_ALERT_EMAIL || 'abdulwahab.dev3@gmail.com').toLowerCase();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!email || !password || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: 'Login details or server configuration are missing.' });
  }

  // Only process the configured admin email; do not turn this endpoint into an email relay.
  if (email !== alertEmail) return res.status(401).json({ error: 'Invalid email or password.' });

  const { ip, location, userAgent } = getRequestDetails(req);
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS_PER_IP) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait 10 minutes and try again.' });
  }
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });

  const timestamp = new Date().toISOString();
  const authResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: supabaseKey },
    body: JSON.stringify({ email, password }),
  });

  if (!authResponse.ok) {
    try {
      await sendAlert('Security alert: failed admin login', [
        'A failed login attempt was made for My Pakistan Trips admin.',
        `Time (UTC): ${timestamp}`,
        `Attempted email: ${email}`,
        `IP address: ${ip}`,
        `Approximate location: ${location}`,
        `Browser/device: ${userAgent}`,
        '',
        'If this was not you, review your admin account security.',
      ]);
    } catch (mailError) {
      console.error('Failed-login email alert could not be sent:', mailError);
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const session: any = await authResponse.json();
  const userId = session?.user?.id;
  if (!userId || !session?.access_token || !session?.refresh_token) {
    return res.status(401).json({ error: 'Unable to complete sign in. Please try again.' });
  }

  const adminResponse = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tour_cms_admins?select=user_id&user_id=eq.${encodeURIComponent(userId)}`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${session.access_token}` } },
  );
  const admins: any[] = adminResponse.ok ? await adminResponse.json() : [];
  if (!admins.some((admin) => admin.user_id === userId)) {
    try {
      await sendAlert('Security alert: non-admin login rejected', [
        'A valid Supabase account attempted to access the My Pakistan Trips admin login but is not on the CMS admin allowlist.',
        `Time (UTC): ${timestamp}`,
        `Attempted email: ${email}`,
        `IP address: ${ip}`,
        `Approximate location: ${location}`,
        `Browser/device: ${userAgent}`,
      ]);
    } catch (mailError) {
      console.error('Non-admin alert could not be sent:', mailError);
    }
    return res.status(403).json({ error: 'This account is not authorized as a CMS admin.' });
  }

  try {
    await sendAlert('Security alert: admin login successful', [
      'A successful admin login was detected on My Pakistan Trips.',
      `Time (UTC): ${timestamp}`,
      `Admin email: ${email}`,
      `IP address: ${ip}`,
      `Approximate location: ${location}`,
      `Browser/device: ${userAgent}`,
    ]);
  } catch (mailError) {
    // Do not lock the legitimate admin out if Gmail temporarily cannot send.
    console.error('Successful-login email alert could not be sent:', mailError);
  }

  return res.status(200).json({ session: {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  } });
}
