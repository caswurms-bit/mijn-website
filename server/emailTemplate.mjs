/**
 * Genereert een nette HTML bevestigingsmail in het Nederlands.
 * @param {Object} params
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.orderNumber
 * @param {Array}  params.items  — [{ name, price }]
 * @param {number} params.totalAmount — in euros (bijv. 1499)
 */
export function buildConfirmationEmail({ customerName, customerEmail, orderNumber, items, totalAmount }) {
  const date = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:#1e293b;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:#2563eb;font-weight:700;text-align:right;">€ ${Number(item.price).toLocaleString('nl-NL')}</td>
    </tr>
  `).join('');

  const totalExclBtw = Math.round(totalAmount / 1.21);
  const btw = totalAmount - totalExclBtw;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bestellingsbevestiging Easy PiCi</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Easy PiCi</p>
              <p style="margin:6px 0 0;font-size:13px;color:#64748b;letter-spacing:1px;text-transform:uppercase;">Bestellingsbevestiging</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e293b;">Bedankt voor je bestelling, ${customerName}!</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">
                We hebben je bestelling ontvangen en gaan er direct mee aan de slag. Je ontvangt zodra je pc klaar is nog een bericht van ons.
              </p>

              <!-- Order info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ordernummer</td>
                  <td style="font-size:13px;color:#1e293b;font-weight:700;text-align:right;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">Datum</td>
                  <td style="font-size:13px;color:#1e293b;font-weight:700;text-align:right;padding-top:8px;">${date}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding-top:8px;">E-mail</td>
                  <td style="font-size:13px;color:#1e293b;font-weight:700;text-align:right;padding-top:8px;">${customerEmail}</td>
                </tr>
              </table>

              <!-- Products -->
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:0.5px;">Bestelde producten</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>

              <!-- Totaal -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">Subtotaal (excl. btw)</td>
                  <td style="padding:6px 0;font-size:13px;color:#64748b;text-align:right;">€ ${totalExclBtw.toLocaleString('nl-NL')}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">BTW (21%)</td>
                  <td style="padding:6px 0;font-size:13px;color:#64748b;text-align:right;">€ ${btw.toLocaleString('nl-NL')}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#94a3b8;">Verzending</td>
                  <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;text-align:right;">Gratis</td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0;font-size:17px;font-weight:900;color:#1e293b;border-top:2px solid #f1f5f9;">Totaal</td>
                  <td style="padding:14px 0 0;font-size:17px;font-weight:900;color:#2563eb;text-align:right;border-top:2px solid #f1f5f9;">€ ${totalAmount.toLocaleString('nl-NL')}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info blok -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;padding:20px;">
                <tr>
                  <td style="font-size:14px;color:#1d4ed8;line-height:1.6;">
                    <strong>Wat gebeurt er nu?</strong><br/>
                    Wij bouwen je pc zorgvuldig en testen hem uitgebreid. Zodra hij klaar is sturen we je een bericht. Heb je vragen? Mail ons op
                    <a href="mailto:info@easypici.nl" style="color:#2563eb;">info@easypici.nl</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Easy PiCi · Handgebouwde gaming pc's · Voorburg, NL</p>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Easy PiCi</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
