// Gedeelde HTML-omlijsting voor alle transactionele e-mails: witte, strakke
// kaart met een donkere header-balk (zelfde register als de site's navbar),
// zodat alle mails er hetzelfde uitzien als Easy PiCi zelf.
const INK = '#0f172a';
const BRAND = '#2563eb';

export function emailLayout({ title, preheader = '', bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="background:${INK};padding:28px 36px;">
              <p style="margin:0;font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Easy PiCi</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Easy PiCi · Handgebouwde gaming pc's · Voorburg, NL</p>
              <p style="margin:6px 0 0;font-size:12px;">
                <a href="mailto:info@easypici.nl" style="color:#94a3b8;text-decoration:none;">info@easypici.nl</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function section(heading, bodyHtml) {
  return `
    <div style="margin-bottom:28px;">
      ${heading ? `<p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">${heading}</p>` : ''}
      ${bodyHtml}
    </div>
  `;
}

export function infoTable(rows) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:38%;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-weight:600;vertical-align:top;">${value}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

export function calloutBox(html, { bg = '#eff6ff', color = '#1d4ed8' } = {}) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:18px 20px;font-size:14px;color:${color};line-height:1.6;">
          ${html}
        </td>
      </tr>
    </table>
  `;
}

export { BRAND, INK };
