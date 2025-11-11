import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Phone Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        color: '#0b1020'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          width: 'min(720px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}>
          <h1 style={{ margin: 0, fontSize: 32 }}>Your Phone Assistant</h1>
          <p style={{ marginTop: 12, color: '#334155' }}>
            Deploy is live. Point your Twilio phone number Voice webhook to:
          </p>
          <code style={{ display: 'block', padding: 12, background: '#0b1020', color: '#e2e8f0', borderRadius: 8 }}>
            https://agentic-eef3961d.vercel.app/api/voice/incoming
          </code>
          <p style={{ marginTop: 12, color: '#334155' }}>
            Calls will be answered by your assistant using speech recognition and voice.
          </p>
          <ul style={{ marginTop: 16, color: '#334155' }}>
            <li>
              Configure environment variables <code>OPENAI_API_KEY</code> (optional) and <code>ASSISTANT_GREETING</code> (optional) in Vercel.
            </li>
            <li>
              If <code>OPENAI_API_KEY</code> is not set, the assistant replies with helpful built-in responses.
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
