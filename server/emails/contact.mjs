import { emailLayout, section, infoTable } from './layout.mjs';
import { escapeHtml } from '../lib/html.mjs';

/**
 * Interne notificatiemail naar info@easypici.nl bij een nieuw bericht via
 * het contactformulier.
 * @param {{ name:string, email:string, subject?:string, message:string, sentAt:Date }} params
 */
export function buildContactNotificationEmail({ name, email, subject: formSubject, message, sentAt }) {
  const subject = 'Nieuw bericht via Easy PiCi';
  const date = sentAt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = sentAt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  const bodyHtml = `
    <p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;">Nieuw bericht via het contactformulier</p>

    ${section(null, infoTable([
      ['Naam', escapeHtml(name)],
      ['E-mailadres', `<a href="mailto:${escapeHtml(email)}" style="color:#2563eb;">${escapeHtml(email)}</a>`],
      ...(formSubject ? [['Onderwerp', escapeHtml(formSubject)]] : []),
      ['Datum', date],
      ['Tijd', time],
    ]))}

    ${section('Bericht', `
      <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
    `)}
  `;

  const html = emailLayout({ title: subject, bodyHtml });

  const text = `Nieuw bericht via het contactformulier.

Naam: ${name}
E-mailadres: ${email}
${formSubject ? `Onderwerp: ${formSubject}\n` : ''}Datum: ${date}
Tijd: ${time}

BERICHT
${message}
`;

  return { subject, html, text };
}

/**
 * Automatische ontvangstbevestiging naar de afzender van het contactformulier.
 * @param {{ name:string }} params
 */
export function buildContactAutoReplyEmail({ name }) {
  const subject = 'Wij hebben je bericht ontvangen';

  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Bedankt voor je bericht${name ? `, ${escapeHtml(name)}` : ''}.</p>
    <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
      Wij proberen binnen één werkdag te reageren.
    </p>
  `;

  const html = emailLayout({ title: subject, bodyHtml });

  const text = `Bedankt voor je bericht${name ? `, ${name}` : ''}.

Wij proberen binnen één werkdag te reageren.

Easy PiCi
`;

  return { subject, html, text };
}
