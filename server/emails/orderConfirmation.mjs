import { emailLayout, section, infoTable } from './layout.mjs';
import { escapeHtml } from '../lib/html.mjs';

const EUR = (n) => `€ ${Number(n).toLocaleString('nl-NL')}`;

/**
 * Bevestigingsmail naar de klant na een geslaagde betaling.
 * @param {Object} params
 * @param {string} params.orderNumber
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {Array<{name:string, tier?:string, color?:string, price:number}>} params.items
 * @param {number} params.totalAmount — in euro's
 * @param {{name?:string, line1?:string, postalCode?:string, city?:string}|null} params.address
 */
export function buildOrderConfirmationEmail({ orderNumber, customerName, customerEmail, items, totalAmount, address }) {
  const subject = 'Bedankt voor je bestelling bij Easy PiCi! 🎉';
  const name = escapeHtml(customerName || 'daar');

  const itemRowsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(item.name)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">
          ${item.tier ? `Uitvoering: ${escapeHtml(item.tier)}` : ''}${item.tier && item.color ? ' · ' : ''}${item.color ? `Kleur: ${escapeHtml(item.color)}` : ''}${(item.tier || item.color) ? ' · ' : ''}Aantal: 1
        </p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:#2563eb;font-weight:700;text-align:right;white-space:nowrap;">${EUR(item.price)}</td>
    </tr>
  `).join('');

  const hasAddress = address && (address.line1 || address.city || address.postalCode);
  const addressHtml = hasAddress
    ? `
      <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.7;">
        ${escapeHtml(address.name || customerName)}<br />
        ${address.line1 ? `${escapeHtml(address.line1)}<br />` : ''}
        ${address.postalCode ? `${escapeHtml(address.postalCode)} ` : ''}${address.city ? escapeHtml(address.city) : ''}<br />
        Nederland
      </p>
    `
    : `<p style="margin:0;font-size:14px;color:#94a3b8;">Nog geen afleveradres bij ons bekend — we nemen hierover contact met je op.</p>`;

  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Bedankt voor je bestelling, ${name}!</p>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      We hebben je betaling succesvol ontvangen (order #${escapeHtml(orderNumber)}). Wij gaan direct aan de slag met het bouwen van jouw pc.
    </p>

    ${section('Bestelling', `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${itemRowsHtml}
        <tr>
          <td style="padding:16px 0 0;font-size:15px;font-weight:900;color:#0f172a;">Betaald bedrag</td>
          <td style="padding:16px 0 0;font-size:17px;font-weight:900;color:#2563eb;text-align:right;">${EUR(totalAmount)}</td>
        </tr>
      </table>
    `)}

    ${section('Afleveradres', addressHtml)}

    ${section('Verzending', `
      <p style="margin:0 0 8px;font-size:14px;color:#334155;line-height:1.6;">Wij bouwen iedere pc met zorg op.</p>
      <p style="margin:0 0 8px;font-size:14px;color:#334155;line-height:1.6;"><strong>Verwachte verzending:</strong> binnen 3 werkdagen.</p>
      <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">Zodra je bestelling onderweg is, ontvang je opnieuw een e-mail.</p>
    `)}

    ${section('Contact', `
      <p style="margin:0 0 8px;font-size:14px;color:#334155;line-height:1.6;">
        Controleer je afleveradres goed. Klopt er iets niet? Neem dan zo snel mogelijk contact met ons op via
        <a href="mailto:info@easypici.nl" style="color:#2563eb;font-weight:600;">info@easypici.nl</a>.
      </p>
    `)}
  `;

  const html = emailLayout({
    title: subject,
    preheader: `Je betaling is ontvangen — order #${orderNumber}`,
    bodyHtml,
  });

  const itemsText = items.map((item) => {
    const details = [item.tier ? `Uitvoering: ${item.tier}` : null, item.color ? `Kleur: ${item.color}` : null, 'Aantal: 1'].filter(Boolean).join(', ');
    return `- ${item.name} (${details}) — ${EUR(item.price)}`;
  }).join('\n');

  const addressText = hasAddress
    ? `${address.name || customerName}\n${address.line1 || ''}\n${[address.postalCode, address.city].filter(Boolean).join(' ')}\nNederland`
    : 'Nog geen afleveradres bij ons bekend — we nemen hierover contact met je op.';

  const text = `Bedankt voor je bestelling, ${customerName}!

We hebben je betaling succesvol ontvangen (order #${orderNumber}). Wij gaan direct aan de slag met het bouwen van jouw pc.

BESTELLING
${itemsText}
Betaald bedrag: ${EUR(totalAmount)}

AFLEVERADRES
${addressText}

VERZENDING
Wij bouwen iedere pc met zorg op.
Verwachte verzending: binnen 3 werkdagen.
Zodra je bestelling onderweg is, ontvang je opnieuw een e-mail.

CONTACT
Controleer je afleveradres goed. Klopt er iets niet? Neem dan zo snel mogelijk contact met ons op via info@easypici.nl.

Easy PiCi · Handgebouwde gaming pc's · Voorburg, NL
`;

  return { subject, html, text };
}
