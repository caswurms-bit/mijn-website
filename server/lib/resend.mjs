import { Resend } from 'resend';

// Enige afzender die overal gebruikt mag worden — geen noreply, geen mail@.
export const FROM = 'Easy PiCi <info@easypici.nl>';

function isConfigured(key) {
  return Boolean(key) && !key.includes('VERVANG');
}

let resendClient = null;
function getClient() {
  if (!isConfigured(process.env.RESEND_API_KEY)) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

/**
 * Verstuurt een mail via Resend, of logt 'm alleen als RESEND_API_KEY nog
 * niet is ingesteld — zo blijft de rest van de flow lokaal testbaar zonder
 * dat een missende key alles laat crashen.
 * @param {{ to: string, bcc?: string, subject: string, html: string, text: string }} params
 */
export async function sendMail({ to, bcc, subject, html, text }) {
  const client = getClient();
  if (!client) {
    console.log(`📧 [RESEND NIET GECONFIGUREERD] Mail naar ${to}: ${subject}`);
    return { skipped: true };
  }
  const result = await client.emails.send({ from: FROM, to, bcc, subject, html, text });
  console.log(`✅ Mail verstuurd naar ${to} — "${subject}"`);
  return result;
}
