import type { NextApiRequest, NextApiResponse } from 'next';

type TwilioBody = {
  SpeechResult?: string;
  CallSid?: string;
  From?: string;
  To?: string;
};

const DEFAULT_VOICE = process.env.ASSISTANT_VOICE || 'Polly.Joanna';
const SYSTEM_PROMPT = process.env.ASSISTANT_SYSTEM_PROMPT ||
  'You are a concise, friendly phone assistant. Speak in short, natural sentences.';

function ensureString(input: unknown): string | undefined {
  if (typeof input === 'string') return input;
  if (input == null) return undefined;
  try {
    const asString = String(input);
    return asString;
  } catch {
    return undefined;
  }
}

async function generateReply(userText: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Simple built-in responses if no OpenAI configured
    const lower = userText.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I help you today?';
    if (lower.includes('time')) return `It is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    if (lower.includes('date') || lower.includes('day')) return `Today is ${new Date().toLocaleDateString()}.`;
    if (lower.includes('goodbye') || lower.includes('bye')) return 'Goodbye! Have a great day.';
    return 'I can help with general questions, appointments, and basic info. What do you need?';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText }
      ],
      temperature: 0.4,
      max_tokens: 120
    })
  });

  if (!response.ok) {
    return 'I am having trouble right now. Please try again later.';
  }

  const data = await response.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) return 'Sorry, I did not understand. Could you rephrase?';
  return text.trim();
}

function xml(strings: TemplateStringsArray, ...values: any[]): string {
  const s = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${s.trim()}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'agentic-eef3961d.vercel.app';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const baseUrl = `${proto}://${host}`;

    let body: TwilioBody;
    if (typeof req.body === 'string') {
      const params = new URLSearchParams(req.body);
      body = Object.fromEntries(params.entries()) as unknown as TwilioBody;
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as TwilioBody;
    } else {
      body = {};
    }

    const speechRaw = ensureString(body.SpeechResult) || '';
    const userText = speechRaw.trim();

    const voice = DEFAULT_VOICE;

    if (!userText) {
      const twimlNoInput = xml`
<Response>
  <Say voice="${voice}">I did not catch that. Please say that again.</Say>
  <Gather input="speech" language="en-US" action="${baseUrl}/api/voice/continue" method="POST" speechTimeout="auto">
    <Say voice="${voice}">What can I help you with?</Say>
  </Gather>
  <Say voice="${voice}">Goodbye.</Say>
  <Hangup/>
</Response>`;
      res.setHeader('Content-Type', 'text/xml');
      res.status(200).send(twimlNoInput);
      return;
    }

    const reply = await generateReply(userText);

    // End call if user says goodbye
    if (/\b(goodbye|bye|hang up|that\'s all|that is all)\b/i.test(userText)) {
      const twimlBye = xml`
<Response>
  <Say voice="${voice}">${reply}</Say>
  <Hangup/>
</Response>`;
      res.setHeader('Content-Type', 'text/xml');
      res.status(200).send(twimlBye);
      return;
    }

    const twiml = xml`
<Response>
  <Say voice="${voice}">${reply}</Say>
  <Gather input="speech" language="en-US" action="${baseUrl}/api/voice/continue" method="POST" speechTimeout="auto">
    <Say voice="${voice}">Anything else?</Say>
  </Gather>
  <Say voice="${voice}">Goodbye.</Say>
  <Hangup/>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml);
  } catch (err) {
    const fallback = xml`
<Response>
  <Say voice="alice">I am having trouble right now. Please call back later.</Say>
  <Hangup/>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(fallback);
  }
}
