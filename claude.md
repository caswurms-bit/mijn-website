# CLAUDE.md — Website Development Rules

## Project Stack (pas aan per project)
- **Framework:** React + TypeScript (Vite) — of plain HTML als opgegeven
- **Styling:** Tailwind CSS
- **Animaties:** Framer Motion
- **Icons:** Lucide React
- **Dev server:** `npm run dev` → `http://localhost:5173`
- Als het een plain HTML project is: `node serve.mjs` → `http://localhost:3000`

## Reference Images
- Als er een referentie-afbeelding is: match layout, spacing, typografie en kleuren exact.
  Gebruik placeholders voor content (`https://placehold.co/WIDTHxHEIGHT`). Verbeter niets.
- Als er geen referentie is: bouw from scratch met hoge kwaliteit (zie guardrails hieronder).

## Screenshot Workflow
- Maak altijd screenshots via localhost — nooit via `file:///`
- Screenshot commando: `node screenshot.mjs http://localhost:5173`
  (of poort 3000 voor plain HTML projecten)
- Screenshots worden opgeslagen in `./temporary screenshots/screenshot-N.png`
- Lees de screenshot daarna met de Read tool en analyseer hem visueel
- Vergelijk altijd minimaal 2 keer met de referentie voor je stopt
- Wees specifiek bij verschillen: "heading is 32px maar referentie toont ~24px"
- Check elke ronde: spacing/padding, font-size/weight, kleuren (exacte hex),
  uitlijning, border-radius, shadows, afbeeldingsverhoudingen

## Brand Assets
- Controleer altijd de `brand_assets/` map voor je begint met ontwerpen
- Als er een logo is: gebruik het — geen placeholder
- Als er een kleurenpalet is: gebruik exact die waarden — verzin geen eigen kleuren
- Als er een stijlgids is: volg die

## Output Standaarden
- **React project:** componenten in losse `.tsx` bestanden, stijlen via Tailwind in de component
- **Plain HTML project:** één `index.html`, alle styles inline, Tailwind via CDN:
  `<script src="https://cdn.tailwindcss.com"></script>`
- Mobiel-first responsive: altijd `sm:` breakpoints voor desktop-uitbreidingen
- Placeholder afbeeldingen: `https://placehold.co/WIDTHxHEIGHT`

## Anti-Generiek Design — Altijd volgen

### Kleuren
- Gebruik nooit standaard Tailwind-palette (indigo-500, blue-600) als primaire kleur
  tenzij het brand dat dicteert
- Kies één merkkleur en leid daar hover/active/accent states van af
- Achtergronden: laag contrast-systeem (base → elevated → floating), nooit alles op één vlak

### Typografie
- Gebruik nooit dezelfde font voor headings en body
- Koppel een display/serif font aan een clean sans-serif
- Grote headings: strakke letter-spacing (`tracking-tight` of `-0.03em`)
- Body: ruime line-height (`leading-relaxed`, ~1.7)

### Schaduwen
- Nooit platte `shadow-md`
- Gebruik gelaagde, kleur-getinte shadows met lage opacity
  Voorbeeld: `shadow-[0_8px_30px_rgba(0,0,0,0.12)]`

### Gradients & Textuur
- Laag meerdere radiale gradients over elkaar
- Voeg grain/textuur toe via SVG noise filter voor diepte waar passend

### Animaties
- Animeer alleen `transform` en `opacity` — nooit `transition-all`
- Gebruik spring-achtige easing: `ease-[cubic-bezier(0.34,1.56,0.64,1)]`
- Entry-animaties: `opacity 0→1` + `y 20→0`, altijd `whileInView` met `once: true`

### Interactieve states
- Elk klikbaar element heeft: hover, focus-visible én active state
- Nooit een knop of link zonder visuele feedback

### Afbeeldingen
- Voeg altijd een gradient overlay toe: `bg-gradient-to-t from-black/60`
- Optioneel: kleurbehandeling via `mix-blend-multiply`

### Spacing
- Gebruik consistente spacing-tokens — niet willekeurige Tailwind-stappen
- Section padding: `py-16 sm:py-24 px-4 sm:px-6`
- Card padding: `p-4 sm:p-6` of `p-6 sm:p-8`

## Hard Rules
- Voeg geen secties, features of content toe die niet gevraagd zijn
- Verbeter een referentie-design niet — match het
- Stop niet na één screenshot-ronde
- Gebruik nooit `transition-all` op geanimeerde properties
- Gebruik nooit standaard Tailwind blauw/indigo als primaire merkkleur
- Alle nieuwe componenten volgen de bestaande animatie- en stijlpatronen in het project