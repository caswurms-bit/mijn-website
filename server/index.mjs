/**
 * Easy PiCi — Backend server
 * Start: node server/index.mjs (vanuit de project root)
 * Poort: 3001
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Zorg dat .env altijd gevonden wordt, ook als je vanuit een andere map start
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { buildConfirmationEmail } from './emailTemplate.mjs';
import { sendMail as sendMailViaResend } from './lib/resend.mjs';
import { buildOrderConfirmationEmail } from './emails/orderConfirmation.mjs';
import { buildNewOrderEmail } from './emails/newOrderNotification.mjs';
import { buildContactNotificationEmail, buildContactAutoReplyEmail } from './emails/contact.mjs';

// ─── Valideer keys bij opstarten ─────────────────────────────────────────────
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY || STRIPE_KEY.includes('VERVANG')) {
  console.error('❌ STRIPE_SECRET_KEY is niet ingesteld in .env!');
  console.error('   Ga naar https://dashboard.stripe.com/test/apikeys en kopieer je sk_test_ key.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;

const stripe = new Stripe(STRIPE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Logging-helper: maskeert e-mailadressen in productielogs ────────────────
// Volledige persoonsgegevens horen niet onnodig in logs — dit houdt genoeg
// over om te herkennen/debuggen zonder het adres leesbaar te loggen.
function maskEmail(email) {
  if (!email) return '(geen e-mail)';
  const [user, domain] = String(email).split('@');
  if (!domain) return '***';
  const maskUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}${'*'.repeat(user.length - 2)}${user.slice(-1)}`;
  const maskDomain = domain.length <= 3 ? `${domain[0]}${'*'.repeat(domain.length - 1)}` : `${domain[0]}${'*'.repeat(domain.length - 3)}${domain.slice(-2)}`;
  return `${maskUser}@${maskDomain}`;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

// Webhook heeft raw body nodig — MOET voor express.json() staan
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Sta verzoeken toe van de Vite dev server
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'https://easypici.nl', 'https://www.easypici.nl'] }));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  console.log('✅ Health check OK');
  res.json({ status: 'ok', stripe: STRIPE_KEY.startsWith('sk_test') ? 'test' : 'live' });
});

// ─── POST /api/create-checkout-session ───────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('\n📦 Checkout request ontvangen');
  console.log('   Items:', JSON.stringify(req.body?.items?.map(i => i.name)));

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Winkelwagen is leeg.' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.target || undefined,
          // Geen images — Stripe accepteert niet alle externe URLs
        },
        unit_amount: Math.round(item.priceNum * 100), // centen
      },
      quantity: 1,
    }));

    console.log('   Stripe session aanmaken...');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      billing_address_collection: 'auto',
      locale: 'nl',
      metadata: {
        items: JSON.stringify(items.map(i => ({ name: i.name, price: i.priceNum }))),
      },
    });

    console.log(`✅ Stripe session aangemaakt: ${session.id}`);
    console.log(`   Redirect URL: ${session.url}`);

    res.json({ url: session.url });

  } catch (error) {
    console.error('❌ Stripe fout:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Helper: verstuur mail via Resend (of log als niet geconfigureerd) ────────
async function sendMail({ to, bcc, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('VERVANG')) {
    console.log(`📧 [RESEND NIET GECONFIGUREERD] Mail naar ${to}: ${subject}`);
    return;
  }
  await resend.emails.send({ from: 'Easy PiCi <onboarding@resend.dev>', to, bcc, subject, html });
  console.log(`✅ Mail verstuurd naar ${to}`);
}

// ─── POST /api/request-build ──────────────────────────────────────────────────
// Aanvraag voor een specifieke build (niet op voorraad / op aanvraag)
app.post('/api/request-build', async (req, res) => {
  const { name, email, buildName, message } = req.body;
  if (!name || !email || !buildName) return res.status(400).json({ error: 'Velden ontbreken.' });

  console.log(`\n📩 Build aanvraag: ${buildName} van ${name} (${email})`);
  console.log(`   Bericht: "${message}"`);

  // Mail naar Easy PiCi (dit is altijd jouw eigen Gmail — werkt altijd met Resend)
  try {
    await sendMail({
      to: 'Easypici.nl@gmail.com',
      subject: `🖥️ Nieuwe build aanvraag: ${buildName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
          <div style="background:#0f172a;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Easy PiCi</p>
            <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:800;">Nieuwe build aanvraag</h1>
          </div>
          <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:110px;">Naam</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Build</td><td style="padding:10px 0;font-weight:700;color:#0f172a;">${buildName}</td></tr>
            </table>
            <div style="margin-top:20px;background:#f8fafc;border-radius:8px;padding:16px 20px;">
              <p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 6px;">BERICHT</p>
              <p style="color:#0f172a;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${message || '(geen bericht ingevuld)'}</p>
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Easy PiCi — Easypici.nl@gmail.com</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Mail naar Easy PiCi mislukt:', err.message);
  }

  // Bevestiging naar klant (kan mislukken op Resend gratis plan als email niet geverifieerd is)
  try {
    await sendMail({
      to: email,
      subject: `Je aanvraag voor de ${buildName} is ontvangen — Easy PiCi`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
          <div style="background:#0f172a;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Easy PiCi</p>
            <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:800;">Aanvraag ontvangen!</h1>
          </div>
          <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">Hi ${name},</p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 16px;">
              Bedankt voor je aanvraag! We hebben je interesse in de <strong style="color:#0f172a;">${buildName}</strong> goed ontvangen.
            </p>
            ${message ? '<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0 0;"><p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 6px;">JOUW BERICHT</p><p style="color:#0f172a;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">' + message + '</p></div>' : ''}
            <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;margin:20px 0;">
              <p style="color:#475569;font-size:14px;margin:0;">
                We nemen zo snel mogelijk — meestal binnen 1 werkdag — contact met je op via dit e-mailadres om alles te bespreken.
              </p>
            </div>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:16px 0 0;">
              Heb je in de tussentijd vragen? Mail ons gerust op
              <a href="mailto:Easypici.nl@gmail.com" style="color:#2563eb;font-weight:600;">Easypici.nl@gmail.com</a>.
            </p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
            Easy PiCi · Voorburg · <a href="mailto:Easypici.nl@gmail.com" style="color:#94a3b8;">Easypici.nl@gmail.com</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Bevestigingsmail naar klant mislukt (normaal op gratis Resend plan):', err.message);
  }

  res.json({ ok: true });
});

// ─── POST /api/request-custom ─────────────────────────────────────────────────
// Aanvraag voor een custom build
app.post('/api/request-custom', async (req, res) => {
  const { name, email, resolution, budget, wishes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Velden ontbreken.' });

  console.log(`\n🛠️  Custom build aanvraag van ${name} (${email})`);

  try {
    await sendMail({
      to: 'Easypici.nl@gmail.com',
      subject: `🛠️ Nieuwe custom build aanvraag van ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
          <div style="background:#0f172a;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Easy PiCi</p>
            <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:800;">Nieuwe custom build aanvraag</h1>
          </div>
          <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:110px;">Naam</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Budget</td><td style="padding:10px 0;font-weight:700;color:#0f172a;">${budget || '—'}</td></tr>
            </table>
            <div style="margin-top:20px;background:#f8fafc;border-radius:8px;padding:16px 20px;">
              <p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 6px;">WENSEN</p>
              <p style="color:#0f172a;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${wishes || '(geen wensen ingevuld)'}</p>
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">Easy PiCi — Easypici.nl@gmail.com</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Mail naar Easy PiCi mislukt:', err.message);
  }

  try {
    await sendMail({
      to: email,
      subject: 'Je custom build aanvraag is ontvangen — Easy PiCi',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
          <div style="background:#0f172a;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Easy PiCi</p>
            <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:800;">Custom build aanvraag ontvangen!</h1>
          </div>
          <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">Hi ${name},</p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 16px;">
              Bedankt voor je aanvraag! We hebben je wensen voor een custom build goed ontvangen en gaan er meteen mee aan de slag.
            </p>
            <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:16px 0;">
              <p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 4px;">BUDGET</p>
              <p style="color:#0f172a;font-weight:700;font-size:15px;margin:0;">${budget}</p>
            </div>
            ${wishes ? '<div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:0 0 16px;"><p style="color:#64748b;font-size:12px;font-weight:600;margin:0 0 6px;">JOUW WENSEN</p><p style="color:#0f172a;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">' + wishes + '</p></div>' : ''}
            <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;margin:0 0 16px;">
              <p style="color:#475569;font-size:14px;margin:0;">
                We nemen zo snel mogelijk — meestal binnen 1 werkdag — contact met je op om je custom build te bespreken en een passend voorstel te maken.
              </p>
            </div>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:16px 0 0;">
              Heb je in de tussentijd vragen? Mail ons gerust op
              <a href="mailto:Easypici.nl@gmail.com" style="color:#2563eb;font-weight:600;">Easypici.nl@gmail.com</a>.
            </p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
            Easy PiCi · Voorburg · <a href="mailto:Easypici.nl@gmail.com" style="color:#94a3b8;">Easypici.nl@gmail.com</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Bevestigingsmail naar klant mislukt:', err.message);
  }

  res.json({ ok: true });
});

// ─── POST /api/contact ────────────────────────────────────────────────────────
// Bericht via het contactformulier op de website: notificatie naar Easy PiCi
// zelf + een automatische ontvangstbevestiging naar de afzender.
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Naam, e-mail en bericht zijn verplicht.' });
  }

  console.log(`\n✉️  Contactformulier: ${name} (${email})`);

  const sentAt = new Date();

  try {
    const notification = buildContactNotificationEmail({ name, email, subject, message, sentAt });
    await sendMailViaResend({ to: 'info@easypici.nl', subject: notification.subject, html: notification.html, text: notification.text });
  } catch (err) {
    console.error('❌ Contact-notificatie mislukt:', err.message);
  }

  try {
    const autoReply = buildContactAutoReplyEmail({ name });
    await sendMailViaResend({ to: email, subject: autoReply.subject, html: autoReply.html, text: autoReply.text });
  } catch (err) {
    console.error('❌ Automatische ontvangstbevestiging mislukt:', err.message);
  }

  res.json({ ok: true });
});

// ─── POST /api/create-payment-intent ─────────────────────────────────────────
// Maakt een PaymentIntent aan voor iDEAL betaling (on-site Elements checkout)
app.post('/api/create-payment-intent', async (req, res) => {
  console.log('\n💳 PaymentIntent request ontvangen');
  console.log('   Items:', JSON.stringify(req.body?.items?.map(i => i.name)));

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Winkelwagen is leeg.' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Math.round(item.priceNum * 100), 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      payment_method_types: ['ideal'],
      metadata: {
        // "items" blijft de volledige, authoritatieve bron (ondersteunt
        // meerdere producten) voor de e-mails. product_name/tier/color zijn
        // korte, vlakke, direct leesbare velden voor het Stripe-dashboard —
        // bij meerdere producten kommagescheiden.
        items: JSON.stringify(items.map(i => ({ name: i.name, tier: i.tier, color: i.selectedColor, price: i.priceNum }))),
        product_name: items.map(i => i.name).join(', '),
        product_tier: items.map(i => i.tier).filter(Boolean).join(', '),
        product_color: items.map(i => i.selectedColor).filter(Boolean).join(', '),
      },
    });

    console.log(`✅ PaymentIntent aangemaakt: ${paymentIntent.id} — €${totalAmount / 100}`);
    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('❌ PaymentIntent fout:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/save-shipping-details ─────────────────────────────────────────
// Slaat het afleveradres op de PaymentIntent op vóórdat de betaling wordt
// bevestigd. Dit is nodig omdat de PaymentIntent al bestaat zodra de checkout
// opent (vóór de klant zijn gegevens invult) en een metadata-update de secret
// key vereist, wat alleen server-side kan. Flat metadata-keys (i.p.v. één
// JSON-blob) zodat het adres ook direct leesbaar is in het Stripe-dashboard
// en later eenvoudig programmatisch te gebruiken is voor verzending.
app.post('/api/save-shipping-details', async (req, res) => {
  const body = req.body || {};
  // Alles als string behandelen en trimmen — voorkomt dat whitespace-only
  // invoer (of een client die per ongeluk een getal stuurt voor postcode/
  // huisnummer) de "verplicht"-check omzeilt.
  const paymentIntentId = String(body.paymentIntentId || '').trim();
  const email = String(body.email || '').trim();
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const street = String(body.street || '').trim();
  const houseNumber = String(body.houseNumber || '').trim();
  const addition = String(body.addition || '').trim();
  const postalCode = String(body.postalCode || '').trim();
  const city = String(body.city || '').trim();
  const country = String(body.country || 'NL').trim().toUpperCase();

  if (!paymentIntentId.startsWith('pi_')) {
    return res.status(400).json({ error: 'Ongeldige paymentIntentId.' });
  }
  if (!firstName || !lastName || !street || !houseNumber || !postalCode || !city) {
    return res.status(400).json({ error: 'Adresgegevens ontbreken of zijn leeg.' });
  }
  // Nederland is voorlopig het enige ondersteunde land.
  if (country !== 'NL') {
    return res.status(400).json({ error: 'Alleen bezorging binnen Nederland wordt momenteel ondersteund.' });
  }

  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        shipping_first_name: firstName,
        shipping_last_name: lastName,
        shipping_street: street,
        shipping_house_number: houseNumber,
        // Alleen zetten als daadwerkelijk ingevuld — Stripe metadata-keys
        // zijn optioneel, en zo staat er geen loze lege toevoeging bij elke
        // order.
        ...(addition ? { shipping_house_number_addition: addition } : {}),
        shipping_postal_code: postalCode,
        shipping_city: city,
        shipping_country: country,
        ...(email ? { shipping_email: email } : {}),
      },
    });
    // Geen naam/adres in de log — alleen het (niet-persoonlijke) PaymentIntent-ID.
    console.log(`✅ Verzendgegevens opgeslagen voor PaymentIntent ${paymentIntentId}`);
    res.json({ ok: true });
  } catch (error) {
    console.error(`❌ Opslaan verzendgegevens mislukt voor PaymentIntent ${paymentIntentId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/payment-intent/:id ──────────────────────────────────────────────
// Voor betrouwbare Google Ads-conversietracking op de successpagina: de
// frontend leest alleen de payment_intent-ID uit de URL en vraagt hier de
// echte status/bedrag op i.p.v. te vertrouwen op een query-param die de
// frontend zelf ooit heeft meegegeven. Retourneert bewust alleen niet-
// gevoelige samenvattingsvelden — geen metadata (bevat naam/adres), geen
// betaalmethode-details.
app.get('/api/payment-intent/:id', async (req, res) => {
  const id = req.params.id;
  if (!id || !id.startsWith('pi_')) {
    return res.status(400).json({ error: 'Ongeldig PaymentIntent-ID.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    res.json({
      status: paymentIntent.status,
      amount_received: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error(`❌ Ophalen PaymentIntent ${id} mislukt:`, error.message);
    res.status(404).json({ error: 'PaymentIntent niet gevonden.' });
  }
});

// ─── POST /api/webhooks/stripe ────────────────────────────────────────────────
// Stripe stuurt dit event nadat de betaling geslaagd is.
// Lokaal testen: stripe listen --forward-to localhost:3001/api/webhooks/stripe
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('VERVANG')) {
    // Webhook nog niet geconfigureerd — event toch verwerken voor lokale tests
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET niet ingesteld, webhook niet geverifieerd.');
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook verificatie mislukt:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`\n🔔 Webhook event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerName  = session.customer_details?.name  || 'Klant';
    const customerEmail = session.customer_details?.email;
    const orderNumber   = session.id.slice(-8).toUpperCase();
    const totalAmount   = Math.round(session.amount_total / 100);
    const items         = JSON.parse(session.metadata?.items || '[]');

    console.log(`   Betaling ontvangen van ${customerEmail} — order #${orderNumber} — €${totalAmount}`);

    if (customerEmail && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('VERVANG')) {
      try {
        await resend.emails.send({
          from: 'Easy PiCi <onboarding@resend.dev>',
          to: customerEmail,
          bcc: 'Easypici.nl@gmail.com',
          subject: 'Bedankt voor je bestelling bij Easy PiCi',
          html: buildConfirmationEmail({ customerName, customerEmail, orderNumber, items, totalAmount }),
        });
        console.log(`✅ Bevestigingsmail verstuurd naar ${customerEmail}`);
      } catch (emailError) {
        console.error('❌ E-mail fout:', emailError.message);
      }
    } else {
      console.log('ℹ️  Resend niet geconfigureerd — e-mail overgeslagen.');
    }
  }

  // De daadwerkelijk actieve betaalflow (embedded Payment Element op de
  // productpagina's) maakt een PaymentIntent aan via
  // /api/create-payment-intent, geen Checkout Session — checkout.session
  // .completed hierboven vuurt dus in de praktijk nooit. Dit is het event
  // dat wél afgaat na een geslaagde betaling.
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Idempotency: Stripe kan hetzelfde event meer dan één keer afleveren
    // (bv. na een timeout of herstart). De metadata-vlag leeft op Stripe
    // zelf, dus blijft betrouwbaar ook als deze server herstart — geen
    // aparte database nodig voor deze simpele check.
    if (paymentIntent.metadata?.confirmation_email_sent === 'true') {
      console.log(`ℹ️  PaymentIntent ${paymentIntent.id} al eerder verwerkt — sla over.`);
      return res.json({ received: true });
    }

    try {
      const paymentMethod = paymentIntent.payment_method
        ? await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
        : null;
      const billingDetails = paymentMethod?.billing_details;
      const meta = paymentIntent.metadata || {};

      // Voorkeur voor het adres dat de klant via het checkout-formulier heeft
      // ingevuld (/api/save-shipping-details, met losse straat/huisnummer/
      // toevoeging) — dit is structureller en betrouwbaarder dan wat Stripe
      // zelf eventueel aan billing_details.address hangt. Fallback op
      // billing_details voor eventuele oudere/edge-case betalingen.
      const hasShippingMeta = Boolean(meta.shipping_street && meta.shipping_city);
      if (!hasShippingMeta) {
        console.warn(`⚠️  Geen shipping-metadata gevonden op PaymentIntent ${paymentIntent.id} — val terug op billing_details (indien aanwezig).`);
      }
      const customerName = hasShippingMeta
        ? `${meta.shipping_first_name || ''} ${meta.shipping_last_name || ''}`.trim()
        : billingDetails?.name || 'Klant';
      const customerEmail = (hasShippingMeta && meta.shipping_email) || billingDetails?.email;

      let address = null;
      if (hasShippingMeta) {
        address = {
          name: customerName,
          line1: `${meta.shipping_street} ${meta.shipping_house_number}${meta.shipping_house_number_addition ? ' ' + meta.shipping_house_number_addition : ''}`.trim(),
          postalCode: meta.shipping_postal_code,
          city: meta.shipping_city,
        };
      } else if (billingDetails?.address) {
        const stripeAddress = billingDetails.address;
        address = {
          name: customerName,
          line1: [stripeAddress.line1, stripeAddress.line2].filter(Boolean).join(' '),
          postalCode: stripeAddress.postal_code,
          city: stripeAddress.city,
        };
      }

      const orderNumber = paymentIntent.id.slice(-8).toUpperCase();
      const totalAmount = Math.round(paymentIntent.amount / 100);
      const items = JSON.parse(paymentIntent.metadata?.items || '[]');
      const paidAt = new Date();

      console.log(`   Betaling ontvangen van ${maskEmail(customerEmail)} — order #${orderNumber} — €${totalAmount}`);

      if (customerEmail) {
        const confirmation = buildOrderConfirmationEmail({ orderNumber, customerName, customerEmail, items, totalAmount, address });
        try {
          await sendMailViaResend({ to: customerEmail, subject: confirmation.subject, html: confirmation.html, text: confirmation.text });
        } catch (err) {
          console.error('❌ Orderbevestiging naar klant mislukt:', err.message);
        }
      } else {
        console.log('ℹ️  Geen klant-e-mail beschikbaar — orderbevestiging overgeslagen.');
      }

      const newOrder = buildNewOrderEmail({ orderNumber, customerName, customerEmail: customerEmail || '(onbekend)', items, totalAmount, address, paymentIntentId: paymentIntent.id, paidAt });
      try {
        await sendMailViaResend({ to: 'info@easypici.nl', subject: newOrder.subject, html: newOrder.html, text: newOrder.text });
      } catch (err) {
        console.error('❌ Interne bestel-notificatie mislukt:', err.message);
      }

      // Pas ná (poging tot) verzenden markeren — zo wordt bij een crash
      // vóór dit punt de mail bij een eventuele Stripe-retry alsnog verstuurd.
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: { ...paymentIntent.metadata, confirmation_email_sent: 'true' },
      });
    } catch (err) {
      console.error('❌ Verwerken van payment_intent.succeeded mislukt:', err.message);
    }
  }

  res.json({ received: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Easy PiCi server draait op http://localhost:${PORT}`);
  console.log(`   Stripe: ${STRIPE_KEY.startsWith('sk_test') ? '🧪 TEST modus' : '🚨 LIVE modus'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
