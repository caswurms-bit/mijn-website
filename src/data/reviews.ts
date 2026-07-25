// Handmatig beheerde reviews-showcase, los van de betaalde Trustpilot-widget
// (die alleen naar het profiel linkt, geen losse reviews toont). Voeg hier
// gewoon een nieuw object toe onderaan de array om een review toe te voegen —
// verder is er niets in de site-code dat aangepast hoeft te worden.
export type Review = {
  name: string;
  location?: string;
  date: string;
  text: string;
  rating?: number; // default 5 als niet opgegeven
};

export const REVIEWS: Review[] = [
  {
    name: 'Jonnie Tonnie',
    location: 'NL',
    date: '22 juli 2026',
    text: 'answered really quickly and pc works great, no complains',
    rating: 5,
  },
];
