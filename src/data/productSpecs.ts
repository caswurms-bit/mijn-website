// Centrale, technische productspecificaties — single source of truth.
// Alle plekken die specs tonen (Cube/Elite productpagina's, winkelwagen,
// checkout, e-mails, Stripe-metadata) lezen hiervandaan i.p.v. eigen,
// losstaande spec-teksten te onderhouden. Merk/model van onderdelen die per
// levering kunnen wisselen (bv. exact SSD- of voedingmerk) staan hier bewust
// NIET in — alleen wat voor elke levering gegarandeerd is.

export interface ProductSpec {
  cpu: string;
  gpu: { model: string; vram: string };
  ram: { capacity: string; modules: string; ddr: string; speedMTs: number };
  storage: string;
  motherboard?: { wifi: boolean };
  psu: { watts: number; tier: string };
  cooling: string;
}

export const PRODUCT_SPECS: Record<string, ProductSpec> = {
  starter: {
    cpu: 'Intel Core i5-14400F',
    gpu: { model: 'GeForce RTX 5060', vram: '8 GB GDDR7' },
    ram: { capacity: '16 GB', modules: '2×8 GB', ddr: 'DDR4', speedMTs: 3200 },
    storage: '1 TB PCIe 4.0 x4 NVMe SSD',
    psu: { watts: 650, tier: '80 PLUS Bronze' },
    cooling: '240 mm AIO-waterkoeling',
  },
  performance: {
    cpu: 'Intel Core i5-14400F',
    gpu: { model: 'GeForce RTX 5060 Ti', vram: '8 GB GDDR7' },
    ram: { capacity: '32 GB', modules: '2×16 GB', ddr: 'DDR4', speedMTs: 3200 },
    storage: '1 TB PCIe 4.0 x4 NVMe SSD',
    psu: { watts: 650, tier: '80 PLUS Bronze' },
    cooling: '240 mm AIO-waterkoeling',
  },
  pro: {
    cpu: 'Intel Core i5-14400F',
    gpu: { model: 'GeForce RTX 5070', vram: '12 GB GDDR7' },
    ram: { capacity: '32 GB', modules: '2×16 GB', ddr: 'DDR4', speedMTs: 3200 },
    storage: '1 TB PCIe 4.0 x4 NVMe SSD',
    psu: { watts: 750, tier: '80 PLUS Gold' },
    cooling: '240 mm AIO-waterkoeling',
  },
  elite: {
    cpu: 'Ryzen 7 9700X',
    gpu: { model: 'GeForce RTX 5070 Ti', vram: '16 GB GDDR7' },
    ram: { capacity: '32 GB', modules: '2×16 GB', ddr: 'DDR5', speedMTs: 6000 },
    storage: '2 TB PCIe 4.0 x4 NVMe SSD',
    motherboard: { wifi: true },
    psu: { watts: 850, tier: '80 PLUS Gold' },
    cooling: '360 mm AIO-waterkoeling',
  },
};

export const OS_TEXT = 'Windows 11 volledig geïnstalleerd en geconfigureerd, zonder licentie.';
export const WARRANTY_TEXT = '2 jaar garantie op de complete pc.';
export const GPU_TECH_NOTE = 'Ondersteunt ray tracing, DLSS 4 en Frame Generation.';
export const TRANSPARENCY_NOTE =
  'Voor enkele componenten kan het exacte merk of model per levering verschillen. We gebruiken altijd een technisch gelijkwaardig of beter onderdeel met minimaal de vermelde specificaties. Wil je vóór bestelling de exacte onderdelen van jouw build weten? Neem dan contact met ons op.';

export const VERTICAL_MOUNT_SURCHARGE = 75;
export const VERTICAL_MOUNT_NOTE = 'De productfoto toont een verticaal gemonteerde videokaart. Kies deze optie voor dezelfde uitstraling.';

export function formatGpu(spec: ProductSpec) {
  return `${spec.gpu.model} — ${spec.gpu.vram}`;
}

export function formatRam(spec: ProductSpec) {
  return `${spec.ram.capacity} (${spec.ram.modules}) ${spec.ram.ddr}-${spec.ram.speedMTs}`;
}

export function formatPsu(spec: ProductSpec) {
  return `${spec.psu.watts}W ${spec.psu.tier}`;
}

export function formatConnectivity(spec: ProductSpec) {
  return spec.motherboard?.wifi ? 'WiFi' : undefined;
}

// De belangrijkste 7-9 regels voor het scanbare "Belangrijkste specificaties"
// blok — connectiviteit wordt alleen getoond wanneer die daadwerkelijk
// gegarandeerd is (nu alleen bij Elite), zodat er nooit een lege of
// generieke regel verschijnt voor tiers zonder WiFi.
export function getKeySpecLines(spec: ProductSpec): [string, string][] {
  const lines: [string, string][] = [
    ['Processor', spec.cpu],
    ['Videokaart', formatGpu(spec)],
    ['Geheugen', formatRam(spec)],
    ['Opslag', spec.storage],
  ];
  const connectivity = formatConnectivity(spec);
  if (connectivity) lines.push(['Connectiviteit', connectivity]);
  lines.push(
    ['Voeding', formatPsu(spec)],
    ['Koeling', spec.cooling],
    ['Windows', OS_TEXT],
    ['Garantie', WARRANTY_TEXT],
  );
  return lines;
}
