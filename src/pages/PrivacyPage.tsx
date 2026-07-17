import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft size={16} />
          Terug naar home
        </a>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-10 sm:mb-14">
          Privacyverklaring
        </h1>

        <div className="space-y-10 sm:space-y-12">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Over ons privacybeleid</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Easy Pici geeft veel om uw privacy. Wij verwerken daarom uitsluitend gegevens die wij nodig hebben voor (het verbeteren van) onze dienstverlening en gaan zorgvuldig om met de informatie die wij over u en uw gebruik van onze diensten hebben verzameld. Wij stellen uw gegevens nooit voor commerciële doelstellingen ter beschikking aan derden.</p>
              <p>Ingangsdatum: 16/07/2026.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Over de gegevensverwerking</h2>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-slate-900 inline">Webwinkelsoftware: Eigen maatwerk website (React). </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Onze webwinkel is zelf ontwikkeld. Er is geen externe partij die als webwinkelsoftware-leverancier toegang heeft tot uw persoonsgegevens.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Webhosting en e-mail: mijn.host. </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Wij nemen webhosting- en e-maildiensten af van mijn.host. mijn.host verwerkt persoonsgegevens namens ons en gebruikt uw gegevens niet voor eigen doeleinden. mijn.host heeft passende technische en organisatorische maatregelen genomen om verlies en ongeoorloofd gebruik van uw persoonsgegevens te voorkomen en heeft geen toegang tot ons postvak.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Payment processor: Stripe. </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Onze webwinkel maakt gebruik van Stripe voor het afhandelen van betalingen (waaronder iDEAL). Bij het afrekenen worden uw betaalgegevens rechtstreeks en versleuteld door Stripe verwerkt; wij slaan zelf geen betaalgegevens op.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Beoordelingen: Trustpilot. </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Als u een review achterlaat, deelt u uw naam en beoordeling met Trustpilot. Trustpilot kan u een verzoek sturen om een review achter te laten na aankoop.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Verzenden en logistiek: PostNL en DHL. </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Voor het uitvoeren van leveringen delen wij uw naam, adres en woonplaatsgegevens met PostNL en/of DHL. Zij gebruiken deze gegevens alleen ten behoeve van het uitvoeren van de overeenkomst.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Facturatie en boekhouden: </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">momenteel handmatig, nog geen software.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 inline">Externe verkoopkanalen: Bol.com en Marktplaats.nl. </dt>
                <dd className="inline text-sm sm:text-base text-slate-600 leading-relaxed">Als u via een van deze platformen een bestelling plaatst, deelt het platform uw bestel- en persoonsgegevens met ons om uw bestelling af te handelen.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Doel van de gegevensverwerking</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij gebruiken uw gegevens uitsluitend ten behoeve van onze dienstverlening. Wij gebruiken uw gegevens niet voor (gerichte) marketing zonder uw expliciete toestemming. Automatisch verzamelde gegevens (zoals IP-adres, browser, besturingssysteem) worden gebruikt om onze dienstverlening te verbeteren en zijn geen persoonsgegevens. In voorkomende gevallen kunnen wij op grond van een wettelijke verplichting gehouden zijn gegevens te delen in verband met fiscaal of strafrechtelijk onderzoek.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Bewaartermijnen</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij bewaren uw gegevens zolang u klant van ons bent, en niet langer dan twee jaar vanaf het laatste contactmoment of transactie, tenzij een wettelijke bewaarplicht (zoals voor facturen) langer geldt.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Uw rechten</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              U heeft het recht op inzage, rectificatie, beperking van de verwerking, overdraagbaarheid, en bezwaar met betrekking tot uw persoonsgegevens. Verzoeken kunt u indienen bij{' '}
              <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>
              ; u ontvangt binnen 30 dagen een reactie. U heeft ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Cookies</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              In het geval dat softwareoplossingen van derde partijen gebruik maken van cookies is dit hierboven vermeld bij de betreffende partij.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Wijzigingen in het privacybeleid</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij behouden het recht ons privacybeleid te wijzigen. Op deze pagina vindt u altijd de meest recente versie.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Contactgegevens</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Easy Pici, tulpentuin 317, 2272 EH Voorburg, Nederland<br />
              T (063) 866-4504<br />
              E info@easypici.nl<br />
              Contactpersoon voor privacyzaken: Cas Wurms
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
