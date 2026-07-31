import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function GarantiePage() {
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
          Garantie & Retouren
        </h1>

        <div className="space-y-10 sm:space-y-12">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Garantie</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Bij Easy PiCi vinden we kwaliteit belangrijk. Daarom wordt iedere computer zorgvuldig gebouwd, getest en gecontroleerd voordat deze wordt verzonden.</p>
              <p>Op iedere Easy PiCi geldt een garantietermijn van 2 jaar. Je mag verwachten dat jouw computer gedurende deze periode functioneert zoals je als consument redelijkerwijs mag verwachten.</p>
              <p>Ontstaat er bij normaal gebruik een technisch defect door een fabricage- of hardwarefout? Neem dan contact met ons op. Wij zorgen voor een passende oplossing, zoals reparatie, vervanging of – indien nodig – terugbetaling.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Wanneer valt een defect niet onder de garantie?</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              De garantie is niet bedoeld voor schade die is ontstaan door onjuist gebruik.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              Hieronder vallen onder andere:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              <li>Schade door vallen, stoten, vocht of andere externe invloeden.</li>
              <li>Schade veroorzaakt door overklokken van de processor, videokaart of het werkgeheugen.</li>
              <li>Schade ontstaan door het wijzigen van BIOS-, firmware- of systeeminstellingen buiten de standaardconfiguratie.</li>
              <li>Defecten die zijn veroorzaakt door eigen reparaties, modificaties of het vervangen van onderdelen.</li>
              <li>Schade door verkeerd aangesloten hardware of accessoires.</li>
              <li>Schade door virussen, malware of onveilige software.</li>
              <li>Normale slijtage of cosmetische beschadigingen die geen invloed hebben op de werking van het product.</li>
            </ul>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wanneer blijkt dat een defect door één van bovenstaande oorzaken is ontstaan, valt dit niet onder de garantie. Uiteraard kunnen wij in veel gevallen wel een reparatie uitvoeren. Je ontvangt hiervoor altijd vooraf een prijsopgave.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Retourneren</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Ben je niet tevreden met je aankoop? Dan kun je je bestelling binnen 14 dagen na ontvangst aanmelden voor retour.</p>
              <p>Na het aanmelden heb je nog 14 dagen de tijd om het product terug te sturen.</p>
              <p>Na ontvangst en controle van de retourzending storten wij het aankoopbedrag, inclusief de oorspronkelijke verzendkosten, uiterlijk binnen 14 dagen terug via dezelfde betaalmethode waarmee is betaald.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Voorwaarden voor retourneren</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              Om een product te kunnen retourneren:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              <li>Het product verkeert in goede staat.</li>
              <li>Het product bevat geen schade die is ontstaan door onjuist gebruik.</li>
              <li>Alle accessoires worden mee teruggestuurd.</li>
              <li>De originele verpakking wordt gebruikt wanneer dit redelijkerwijs mogelijk is.</li>
            </ul>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Je mag een product uitpakken en beoordelen zoals je dat ook in een fysieke winkel zou mogen doen. Gaat het gebruik verder dan nodig is om het product te beoordelen, dan kan een eventuele waardevermindering worden verrekend.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Maatwerk</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Sommige computers kunnen speciaal volgens de wensen van de klant worden aangepast.</p>
              <p>Wanneer een computer volledig volgens jouw persoonlijke specificaties wordt samengesteld, kan het wettelijke herroepingsrecht vervallen volgens de Nederlandse wet.</p>
              <p>Wanneer dit van toepassing is, wordt dit altijd duidelijk aangegeven vóór het plaatsen van de bestelling.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Defect of transportschade</h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>Controleer je bestelling direct na ontvangst.</p>
              <p>
                Is je computer beschadigd aangekomen of werkt er iets niet zoals verwacht? Neem dan zo snel mogelijk contact met ons op via{' '}
                <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>.
              </p>
              <p>Wij zoeken altijd samen naar een passende oplossing.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Retour aanmelden</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              Wil je een product retourneren?
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              Stuur dan een e-mail naar{' '}
              <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>{' '}
              met:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              <li>Je naam</li>
              <li>Je ordernummer</li>
              <li>Eventueel een korte omschrijving van de reden van retour</li>
            </ul>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Wij sturen je vervolgens de verdere retourinstructies.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Kosten van retourneren</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              De kosten voor het retourneren zijn voor rekening van de klant, tenzij sprake is van een verkeerd geleverd of defect product.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Contact</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
              Heb je vragen over garantie of een retour?
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-1">
              Neem gerust contact met ons op via:
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Easy PiCi<br />
              <a href="mailto:info@easypici.nl" className="text-brand-600 font-semibold hover:underline">info@easypici.nl</a>
            </p>
          </section>

          {/* Vriendelijk infoblok, zelfde USP-boxstijl als op de productpagina's
              (bg-brand-50 border border-brand-100), zodat deze pagina
              visueel aansluit bij de rest van de site. */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-brand-600 shrink-0" />
              <h3 className="text-base sm:text-lg font-black text-slate-900">Wij geloven in service</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Loopt er iets niet zoals verwacht? Neem gerust contact met ons op voordat je een retour aanvraagt. In veel gevallen kunnen we het probleem snel oplossen, zodat je zo snel mogelijk weer kunt gamen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
