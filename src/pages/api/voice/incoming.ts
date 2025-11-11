import type { NextApiRequest, NextApiResponse } from 'next';

function xml(strings: TemplateStringsArray, ...values: any[]): string {
  const s = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${s.trim()}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'agentic-eef3961d.vercel.app';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const baseUrl = `${proto}://${host}`;

  const greeting = process.env.ASSISTANT_GREETING || 'Hi, this is your assistant. How can I help you today?';
  const voice = process.env.ASSISTANT_VOICE || 'Polly.Joanna'; // Fallback to 'alice' if Polly voice unavailable in your Twilio region

  const twiml = xml`
<Response>
  <Say voice="${voice}">${greeting}</Say>
  <Gather input="speech" language="en-US" action="${baseUrl}/api/voice/continue" method="POST" speechTimeout="auto">
    <Say voice="${voice}">Please tell me what you need.</Say>
  </Gather>
  <Say voice="${voice}">I did not catch that. Goodbye.</Say>
  <Hangup/>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
