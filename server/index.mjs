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

// ─── Valideer keys bij opstarten ─────────────────────────────────────────────
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY || STRIPE_KEY.includes('VERVANG')) {
  console.error('❌ STRIPE_SECRET_KEY is niet ingesteld in .env!');
  console.error('   Ga naar https://dashboard.stripe.com/test/apikeys en kopieer je sk_test_ key.');
  process.exit(1);
}

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

const stripe = new Stripe(STRIPE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Middleware ───────────────────────────────────────────────────────────────

// Webhook heeft raw body nodig — MOET voor express.json() staan
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Sta verzoeken toe van de Vite dev server
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
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
        items: JSON.stringify(items.map(i => ({ name: i.name, price: i.priceNum }))),
      },
    });

    console.log(`✅ PaymentIntent aangemaakt: ${paymentIntent.id} — €${totalAmount / 100}`);
    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('❌ PaymentIntent fout:', error.message);
    res.status(500).json({ error: error.message });
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

  res.json({ received: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Easy PiCi server draait op http://localhost:${PORT}`);
  console.log(`   Stripe: ${STRIPE_KEY.startsWith('sk_test') ? '🧪 TEST modus' : '🚨 LIVE modus'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
