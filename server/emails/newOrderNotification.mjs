import { emailLayout, section, infoTable } from './layout.mjs';
import { escapeHtml } from '../lib/html.mjs';

const EUR = (n) => `€ ${Number(n).toLocaleString('nl-NL')}`;

/**
 * Interne notificatiemail naar info@easypici.nl bij een nieuwe, betaalde
 * bestelling — bevat alles wat nodig is om de order te verwerken zonder
 * Stripe zelf te hoeven openen.
 * @param {Object} params
 * @param {string} params.orderNumber
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {Array<{name:string, tier?:string, color?:string, price:number, mount?:string}>} params.items
 * @param {number} params.totalAmount
 * @param {{name?:string, line1?:string, postalCode?:string, city?:string}|null} params.address
 * @param {string} params.paymentIntentId
 * @param {Date} params.paidAt
 */
export function buildNewOrderEmail({ orderNumber, customerName, customerEmail, items, totalAmount, address, paymentIntentId, paidAt }) {
  const productNames = items.map((i) => i.name).join(', ');
  const subject = `Nieuwe bestelling - ${productNames}`;

  const date = paidAt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = paidAt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  const hasAddress = address && (address.line1 || address.city || address.postalCode);
  const addressLine = hasAddress
    ? `${escapeHtml(address.name || customerName)}, ${escapeHtml(address.line1 || '')}, ${escapeHtml([address.postalCode, address.city].filter(Boolean).join(' '))}, Nederland`
    : 'Niet opgegeven';

  const productRows = items.map((item) => [
    'Product',
    `${escapeHtml(item.name)}${item.tier ? ` · Uitvoering: ${escapeHtml(item.tier)}` : ''}${item.color ? ` · Kleur: ${escapeHtml(item.color)}` : ''} · Aantal: 1${item.mount === 'vertical' ? ' · Verticale montage' : ''} · ${EUR(item.price)}`,
  ]);

  const bodyHtml = `
    <p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;">Nieuwe bestelling ontvangen</p>

    ${section('Klant', infoTable([
      ['Naam', escapeHtml(customerName)],
      ['E-mailadres', `<a href="mailto:${escapeHtml(customerEmail)}" style="color:#2563eb;">${escapeHtml(customerEmail)}</a>`],
      ['Afleveradres', addressLine],
    ]))}

    ${section('Bestelling', infoTable([
      ...productRows,
      ['Betaald bedrag', `<strong>${EUR(totalAmount)}</strong>`],
    ]))}

    ${section('Betaling', infoTable([
      ['Stripe Payment Intent', escapeHtml(paymentIntentId)],
      ['Datum', date],
      ['Tijd', time],
      ['Status', '<span style="color:#16a34a;font-weight:700;">Betaald ✅</span>'],
    ]))}
  `;

  const html = emailLayout({ title: subject, bodyHtml });

  const productLines = items.map((item) =>
    `- ${item.name}${item.tier ? ` · Uitvoering: ${item.tier}` : ''}${item.color ? ` · Kleur: ${item.color}` : ''} · Aantal: 1${item.mount === 'vertical' ? ' · Verticale montage' : ''} · ${EUR(item.price)}`
  ).join('\n');

  const text = `Nieuwe bestelling ontvangen.

KLANT
Naam: ${customerName}
E-mailadres: ${customerEmail}
Afleveradres: ${hasAddress ? `${address.name || customerName}, ${address.line1 || ''}, ${[address.postalCode, address.city].filter(Boolean).join(' ')}, Nederland` : 'Niet opgegeven'}

BESTELLING
${productLines}
Betaald bedrag: ${EUR(totalAmount)}

BETALING
Stripe Payment Intent: ${paymentIntentId}
Datum: ${date}
Tijd: ${time}
Status: Betaald
`;

  return { subject, html, text };
}
