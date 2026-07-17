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

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
          Privacybeleid Easy Pici
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mb-10 sm:mb-14">https://www.easypici.nl</p>

        <div className="space-y-10 sm:space-y-12">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Over ons privacybeleid</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Easy Pici geeft veel om uw privacy. Wij verwerken daarom uitsluitend gegevens die wij nodig hebben voor (het verbeteren van) onze dienstverlening en gaan zorgvuldig om met de informatie die wij over u en uw gebruik van onze diensten hebben verzameld. Wij stellen uw gegevens nooit voor commerciële doelstellingen ter beschikking aan derden.</p>
              <p>Dit privacybeleid is van toepassing op het gebruik van de website en de daarop ontsloten dienstverlening van Easy Pici. De ingangsdatum voor de geldigheid van deze voorwaarden is 16/07/2026, met het publiceren van een nieuwe versie vervalt de geldigheid van alle voorgaande versies. Dit privacybeleid beschrijft welke gegevens over u door ons worden verzameld, waar deze gegevens voor worden gebruikt en met wie en onder welke voorwaarden deze gegevens eventueel met derden kunnen worden gedeeld. Ook leggen wij aan u uit op welke wijze wij uw gegevens opslaan en hoe wij uw gegevens tegen misbruik beschermen en welke rechten u heeft met betrekking tot de door u aan ons verstrekte persoonsgegevens.</p>
              <p>Als u vragen heeft over ons privacybeleid kunt u contact opnemen met onze contactpersoon voor privacyzaken, u vindt de contactgegevens aan het einde van ons privacybeleid.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Over de gegevensverwerking</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Hieronder kan u lezen op welke wijze wij uw gegevens verwerken, waar wij deze (laten) opslaan, welke beveiligingstechnieken wij gebruiken en voor wie de gegevens inzichtelijk zijn.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Webwinkelsoftware</h3>
                <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">Eigen maatwerk website (React)</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Onze webwinkel is zelf ontwikkeld (maatwerk). Er is geen externe partij die als webwinkelsoftware-leverancier toegang heeft tot uw persoonsgegevens.</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Webhosting</h3>
                <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">mijn.host</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Wij maken voor ons reguliere zakelijke e-mailverkeer gebruik van de diensten van mijn.host. Deze partij heeft passende technische en organisatorische maatregelen getroffen om misbruik, verlies en corruptie van uw en onze gegevens zoveel mogelijk te voorkomen. mijn.host heeft geen toegang tot ons postvak en wij behandelen al ons e-mailverkeer vertrouwelijk.</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Payment processors</h3>
                <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">Stripe</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Onze webwinkel maakt gebruik van Stripe voor het afhandelen van betalingen (waaronder iDEAL). Bij het afrekenen worden uw betaalgegevens rechtstreeks en versleuteld door Stripe verwerkt; wij slaan zelf geen betaalgegevens (zoals volledige kaartgegevens) op. Stripe is verantwoordelijk voor de beveiliging van deze gegevens conform hun eigen privacybeleid.</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Beoordelingen</h3>
                <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">Trustpilot</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Onze webwinkel maakt gebruik van Trustpilot om klantbeoordelingen te verzamelen en weer te geven. Als u een review achterlaat, deelt u uw naam en beoordeling met Trustpilot. Trustpilot kan u een verzoek sturen om een review achter te laten na aankoop. Trustpilot is verantwoordelijk voor de verwerking van deze gegevens conform hun eigen privacybeleid.</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Verzenden en logistiek</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">PostNL</p>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Als u een bestelling bij ons plaatst is het onze taak om uw pakket bij u te laten bezorgen. Wij maken gebruik van de diensten van PostNL voor het uitvoeren van de leveringen. Het is daarvoor noodzakelijk dat wij uw naam, adres en woonplaatsgegevens met PostNL delen. PostNL gebruikt deze gegevens alleen ten behoeve van het uitvoeren van de overeenkomst. In het geval dat PostNL onderaannemers inschakelt, stelt PostNL uw gegevens ook aan deze partijen ter beschikking.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">DHL</p>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Als u een bestelling bij ons plaatst is het onze taak om uw pakket bij u te laten bezorgen. Wij maken gebruik van de diensten van DHL voor het uitvoeren van de leveringen. Het is daarvoor noodzakelijk dat wij uw naam, adres en woonplaatsgegevens met DHL delen. DHL gebruikt deze gegevens alleen ten behoeve van het uitvoeren van de overeenkomst. In het geval dat DHL onderaannemers inschakelt, stelt DHL uw gegevens ook aan deze partijen ter beschikking.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Facturatie en boekhouden</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Momenteel handmatig, nog geen software.</p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Externe verkoopkanalen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">Bol.com</p>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Wij verkopen (een deel van) onze artikelen via het platform van Bol.com. Als u via dit platform een bestelling plaatst dan deelt Bol.com uw bestel- en persoonsgegevens met ons. Wij gebruiken deze gegevens om uw bestelling af te handelen. Wij gaan vertrouwelijk met uw gegevens om en hebben passende technische en organisatorische maatregelen getroffen om uw gegevens te beschermen tegen verlies en ongeoorloofd gebruik.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base mb-1">Marktplaats.nl</p>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Wij verkopen (een deel van) onze artikelen via het platform van Marktplaats.nl. Als u via dit platform een bestelling plaatst dan deelt Marktplaats.nl uw bestel- en persoonsgegevens met ons. Wij gebruiken deze gegevens om uw bestelling af te handelen. Wij gaan vertrouwelijk met uw gegevens om en hebben passende technische en organisatorische maatregelen getroffen om uw gegevens te beschermen tegen verlies en ongeoorloofd gebruik.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Doel van de gegevensverwerking</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Algemeen doel van de verwerking</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Wij gebruiken uw gegevens uitsluitend ten behoeve van onze dienstverlening. Dat wil zeggen dat het doel van de verwerking altijd direct verband houdt met de opdracht die u verstrekt. Wij gebruiken uw gegevens niet voor (gerichte) marketing. Als u gegevens met ons deelt en wij gebruiken deze gegevens om - anders dan op uw verzoek - op een later moment contact met u op te nemen, vragen wij u hiervoor expliciet toestemming. Uw gegevens worden niet met derden gedeeld, anders dan om aan boekhoudkundige en overige administratieve verplichtingen te voldoen. Deze derden zijn allemaal tot geheimhouding gehouden op grond van de overeenkomst tussen hen en ons of een eed of wettelijke verplichting.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Automatisch verzamelde gegevens</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Gegevens die automatisch worden verzameld door onze website worden verwerkt met het doel onze dienstverlening verder te verbeteren. Deze gegevens (bijvoorbeeld uw IP-adres, webbrowser en besturingssysteem) zijn geen persoonsgegevens.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Medewerking aan fiscaal en strafrechtelijk onderzoek</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">In voorkomende gevallen kan Easy Pici op grond van een wettelijke verplichting worden gehouden tot het delen van uw gegevens in verband met fiscaal of strafrechtelijk onderzoek van overheidswege. In een dergelijk geval zijn wij gedwongen uw gegevens te delen, maar wij zullen ons binnen de mogelijkheden die de wet ons biedt daartegen verzetten.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Bewaartermijnen</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij bewaren uw gegevens zolang u cliënt van ons bent. Dit betekent dat wij uw klantprofiel bewaren totdat u aangeeft dat u niet langer van onze diensten gebruik wenst te maken. Als u dit bij ons aangeeft zullen wij dit tevens opvatten als een vergeetverzoek. Dit betekent ook dat we uw gegevens niet langer dan twee jaar bewaren vanaf het laatste contactmoment of transactie, tenzij daarvoor een wettelijke rechtvaardigingsgrond ten grondslag ligt. Op grond van toepasselijke administratieve verplichtingen dienen wij facturen met uw (persoons)gegevens te bewaren, deze gegevens zullen wij dus voor zolang de toepasselijke termijn loopt bewaren. Medewerkers hebben echter geen toegang meer tot uw cliëntprofiel en documenten die wij naar aanleiding van uw opdracht hebben vervaardigd.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Uw rechten</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Op grond van de geldende Nederlandse en Europese wetgeving heeft u als betrokkene bepaalde rechten met betrekking tot de persoonsgegevens die door of namens ons worden verwerkt. Wij leggen u hieronder uit welke rechten dit zijn en hoe u zich op deze rechten kunt beroepen. In beginsel sturen wij om misbruik te voorkomen afschriften en kopieën van uw gegevens enkel naar uw bij ons reeds bekende e-mailadres. In het geval dat u de gegevens op een ander e-mailadres of bijvoorbeeld per post wenst te ontvangen, zullen wij u vragen zich te legitimeren. Wij houden een administratie bij van afgehandelde verzoeken, in het geval van een vergeetverzoek administreren wij geanonimiseerde gegevens. Alle afschriften en kopieën van gegevens ontvangt u in de machineleesbare gegevensindeling die wij binnen onze systemen hanteren. U heeft te allen tijde het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens als u vermoedt dat wij uw persoonsgegevens op een verkeerde manier gebruiken.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Inzagerecht</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">U heeft altijd het recht om de gegevens die wij (laten) verwerken en die betrekking hebben op uw persoon of daartoe herleidbaar zijn, in te zien. U kunt een verzoek met die strekking doen aan onze contactpersoon voor privacyzaken. U ontvangt dan binnen 30 dagen een reactie op uw verzoek. Als uw verzoek wordt ingewilligd sturen wij u op het bij ons bekende e-mailadres een kopie van alle gegevens met een overzicht van de verwerkers die deze gegevens onder zich hebben, onder vermelding van de categorie waaronder wij deze gegevens hebben opgeslagen.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Rectificatierecht</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">U heeft altijd het recht om de gegevens die wij (laten) verwerken en die betrekking hebben op uw persoon of daartoe herleidbaar zijn, te laten aanpassen. U kunt een verzoek met die strekking doen aan onze contactpersoon voor privacyzaken. U ontvangt dan binnen 30 dagen een reactie op uw verzoek. Als uw verzoek wordt ingewilligd sturen wij u op het bij ons bekende e-mailadres een bevestiging dat de gegevens zijn aangepast.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Recht op beperking van de verwerking</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">U heeft altijd het recht om de gegevens die wij (laten) verwerken die betrekking hebben op uw persoon of daartoe herleidbaar zijn, te beperken. U kunt een verzoek met die strekking doen aan onze contactpersoon voor privacyzaken. U ontvangt dan binnen 30 dagen een reactie op uw verzoek. Als uw verzoek wordt ingewilligd sturen wij u op het bij ons bekende e-mailadres een bevestiging dat de gegevens tot u de beperking opheft niet langer worden verwerkt.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Recht op overdraagbaarheid</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">U heeft altijd het recht om de gegevens die wij (laten) verwerken en die betrekking hebben op uw persoon of daartoe herleidbaar zijn, door een andere partij te laten uitvoeren. U kunt een verzoek met die strekking doen aan onze contactpersoon voor privacyzaken. U ontvangt dan binnen 30 dagen een reactie op uw verzoek. Als uw verzoek wordt ingewilligd sturen wij u op het bij ons bekende e-mailadres afschriften of kopieën van alle gegevens over u die wij hebben verwerkt of in opdracht van ons door andere verwerkers of derden zijn verwerkt. Naar alle waarschijnlijkheid kunnen wij in een dergelijk geval de dienstverlening niet langer voortzetten, omdat de veilige koppeling van databestanden dan niet langer kan worden gegarandeerd.</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Recht van bezwaar en overige rechten</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">U heeft in voorkomende gevallen het recht bezwaar te maken tegen de verwerking van uw persoonsgegevens door of in opdracht van Easy Pici. Als u bezwaar maakt zullen wij onmiddellijk de gegevensverwerking staken in afwachting van de afhandeling van uw bezwaar. Is uw bezwaar gegrond dat zullen wij afschriften en/of kopieën van gegevens die wij (laten) verwerken aan u ter beschikking stellen en daarna de verwerking blijvend staken. U heeft bovendien het recht om niet aan geautomatiseerde individuele besluitvorming of profiling te worden onderworpen. Wij verwerken uw gegevens niet op zodanige wijze dat dit recht van toepassing is. Bent u van mening dat dit wel zo is, neem dan contact op met onze contactpersoon voor privacyzaken.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Cookies</h2>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Cookies van derde partijen</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">In het geval dat softwareoplossingen van derde partijen gebruik maken van cookies is dit vermeld in deze privacyverklaring.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Wijzigingen in het privacybeleid</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij behouden te allen tijde het recht ons privacybeleid te wijzigen. Op deze pagina vindt u echter altijd de meest recente versie. Als het nieuwe privacybeleid gevolgen heeft voor de wijze waarop wij reeds verzamelde gegevens met betrekking tot u verwerken, dan brengen wij u daarvan per e-mail op de hoogte.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Contactgegevens</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-1">Easy Pici</p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              tulpentuin 317 voorburg Nederland T (063) 866-4504 E{' '}
              <a href="mailto:cas.wurms@gmail.com" className="text-brand-600 font-semibold hover:underline">cas.wurms@gmail.com</a>
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-4">
              Contactpersoon voor privacyzaken<br />
              Cas Wurms
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
