// Escaped alle gebruikers-invoer (naam, e-mail, bericht, adres) vóór het in
// een e-mail-HTML-template terechtkomt — voorkomt dat iemand met rare tekens
// in een formulierveld de mail-opmaak breekt of markup injecteert.
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
