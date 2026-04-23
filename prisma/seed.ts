import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./data/app.db",
});
const prisma = new PrismaClient({ adapter });

type SeedQuestion = {
  topicSlug: string;
  kind: "mc" | "open";
  stemCs: string;
  choices?: string[];
  correctAnswer: string;
  explanationCs: string;
  sourceRef: string;
};

const topics = [
  { slug: "anatomie", nameCs: "Anatomie a fyziologie", weight: 1.2 },
  { slug: "kontraindikace-a-kuze", nameCs: "Kontraindikace a kůže", weight: 1.3 },
];

const NSK_ANATOMIE = "NSK 69-037-M § Doména 2 – Fyzické posouzení (docs/sources/NSK-69-037-M-hodnotici-standard.md)";
const NSK_KONTRA = "NSK 69-037-M § Doména 2.5 – Kůže a kontraindikace (docs/sources/NSK-69-037-M-hodnotici-standard.md)";
const CURRICULUM = "docs/curriculum.md § 2 Physical Assessment";

const questions: SeedQuestion[] = [
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Kolik kostí tvoří průměrnou kostru dospělého člověka?",
    choices: ["186", "206", "226", "246"],
    correctAnswer: "206",
    explanationCs: "Dospělý člověk má přibližně 206 kostí. Novorozenec jich má více (některé během růstu srůstají, např. kosti lebky a křížová kost).",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Která z následujících kostí patří mezi kosti dlouhé?",
    choices: ["Kost klínová", "Obratel", "Stehenní kost (femur)", "Čéška (patella)"],
    correctAnswer: "Stehenní kost (femur)",
    explanationCs: "Dlouhé kosti mají tělo (diafýzu) a dvě rozšířené konce (epifýzy). Typickými příklady jsou femur, humerus, tibia, fibula. Patella je kost sezamská, obratel patří mezi kosti nepravidelné.",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Ramenní kloub je z hlediska tvaru kloubních ploch kloubem:",
    choices: ["Pantovým", "Kulovým", "Sedlovým", "Plochým"],
    correctAnswer: "Kulovým",
    explanationCs: "Ramenní kloub (articulatio humeri) je kulový volný kloub – umožňuje pohyb ve všech třech osách (flexe/extenze, abdukce/addukce, rotace).",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Loketní kloub mezi humerem a ulnou je kloubem:",
    choices: ["Kulovým", "Pantovým", "Sedlovým", "Kondylárním"],
    correctAnswer: "Pantovým",
    explanationCs: "Mezi humerem a ulnou je pantový (válcový) kloub umožňující pouze flexi a extenzi v jedné ose. Rotaci předloktí (pronaci/supinaci) zajišťuje radioulnární kloub.",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Která kost je nejdelší a nejsilnější kostí lidského těla?",
    choices: ["Pažní kost (humerus)", "Holenní kost (tibia)", "Pánevní kost", "Stehenní kost (femur)"],
    correctAnswer: "Stehenní kost (femur)",
    explanationCs: "Femur je nejdelší, nejsilnější a nejtěžší kost lidského těla. Nese hlavní zatížení při stoji a chůzi.",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Sval m. trapezius (trapézový sval) působí především na:",
    choices: ["Loketní kloub", "Zápěstí", "Lopatku a krční páteř", "Kolenní kloub"],
    correctAnswer: "Lopatku a krční páteř",
    explanationCs: "M. trapezius pohybuje lopatkou (elevace, deprese, retrakce, rotace) a podílí se na extenzi a úklonu krční páteře. Je klíčový pro postýrů a masáž horní části zad.",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Hlavní funkcí m. biceps brachii je:",
    choices: ["Extenze lokte", "Flexe lokte a supinace předloktí", "Abdukce ramene", "Rotace hlavy"],
    correctAnswer: "Flexe lokte a supinace předloktí",
    explanationCs: "M. biceps brachii je dvouhlavý sval pažní – ohýbá v lokti a zároveň supinuje (otáčí dlaní nahoru) předloktí. Antagonistou je m. triceps brachii.",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Kosterní sval je řízen:",
    choices: ["Autonomním nervovým systémem", "Pouze hormonálně", "Volní (somatickou) kontrolou", "Jen míšními reflexy"],
    correctAnswer: "Volní (somatickou) kontrolou",
    explanationCs: "Kosterní sval je pod volní kontrolou somatického nervového systému (na rozdíl od hladkého svalstva a srdečního svalstva, které řídí autonomní systém).",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Pojmem „origo“ (začátek) svalu se rozumí:",
    choices: ["Místo úponu na pohyblivější kosti", "Pevnější začátek svalu na méně pohyblivé kosti", "Prostřední část svalu", "Šlachovité zakončení"],
    correctAnswer: "Pevnější začátek svalu na méně pohyblivé kosti",
    explanationCs: "Origo je proximální, obvykle pevnější začátek svalu; insertio (úpon) je distální konec, který se při kontrakci přibližuje k origu. Rozlišení pomáhá určit funkci svalu.",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Izometrická kontrakce je taková, při které sval:",
    choices: ["Se zkracuje a pohybuje kloubem", "Se prodlužuje pod zátěží", "Vyvíjí napětí bez změny délky", "Ztrácí napětí úplně"],
    correctAnswer: "Vyvíjí napětí bez změny délky",
    explanationCs: "Při izometrické kontrakci se mění svalové napětí, ale nemění se délka svalu (např. držení břemene v klidu). Izotonická kontrakce mění délku při zachování napětí.",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Hlavním nádechovým svalem je:",
    choices: ["Bránice (diafragma)", "M. rectus abdominis", "M. pectoralis minor", "Mezižeberní svaly vnější jen"],
    correctAnswer: "Bránice (diafragma)",
    explanationCs: "Bránice je hlavní inspirační sval; její kontrakce snižuje klenbu a zvětšuje objem hrudníku, čímž dochází k nádechu. Mezižeberní svaly jsou pomocné.",
    sourceRef: `${NSK_ANATOMIE} § 2.3 Dýchací soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Výměna plynů (O₂ a CO₂) mezi vzduchem a krví probíhá v:",
    choices: ["Průdušnici (trachea)", "Velkých bronších", "Plicních sklípcích (alveolech)", "Pohrudnici"],
    correctAnswer: "Plicních sklípcích (alveolech)",
    explanationCs: "V plicních alveolech je tenká stěna (jedna vrstva buněk) a bohatá kapilární síť – ideální pro difuzi plynů. Trachea a bronchy jsou pouze vedení vzduchu.",
    sourceRef: `${NSK_ANATOMIE} § 2.3 Dýchací soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Tepny (arterie) vedou krev:",
    choices: ["Vždy k srdci", "Vždy od srdce", "Jen v plicním oběhu", "Jen v systémovém oběhu"],
    correctAnswer: "Vždy od srdce",
    explanationCs: "Definice: tepny vedou krev od srdce (bez ohledu na obsah kyslíku). V plicním oběhu tedy tepny (plicnice) nesou odkysličenou krev, v systémovém oběhu okysličenou.",
    sourceRef: `${NSK_ANATOMIE} § 2.4 Oběhová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Mízní (lymfatické) uzliny jsou součástí:",
    choices: ["Nervového systému", "Endokrinního systému", "Lymfatického (imunitního) systému", "Trávicího systému"],
    correctAnswer: "Lymfatického (imunitního) systému",
    explanationCs: "Mízní uzliny filtrují lymfu a účastní se imunitní reakce. Při masáži se vyhýbáme tlaku přímo na uzliny a respektujeme směr odtoku lymfy k centrálním uzlinám.",
    sourceRef: `${NSK_ANATOMIE} § 2.4 Oběhová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "mc",
    stemCs: "Při klasické masáži končetin směřují hlavní tahy převážně:",
    choices: ["Od srdce k periferii (proti směru žilního návratu)", "Od periferie k srdci (ve směru žilního návratu)", "Vždy od hlavy k patě", "Libovolně, směr nehraje roli"],
    correctAnswer: "Od periferie k srdci (ve směru žilního návratu)",
    explanationCs: "Masáž podporuje žilní a lymfatický návrat, proto dlouhé tahy (effleurage) vedeme od periferie (distálně) směrem k srdci (proximálně). Opačný směr by zatěžoval chlopně žil.",
    sourceRef: `${NSK_ANATOMIE} § 2.4 Oběhová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "open",
    stemCs: "Vyjmenujte tři základní typy synoviálních kloubů podle tvaru kloubních ploch a ke každému uveďte anatomický příklad.",
    correctAnswer: "Kulový kloub (např. ramenní, kyčelní); pantový/válcový kloub (např. loketní, mezičlánkové klouby prstů); sedlový kloub (např. karpometakarpální kloub palce ruky). Další přijatelné: kondylární (kolenní), plochý (meziobratlové), čepový (atlanto-axiální).",
    explanationCs: "Tvar kloubních ploch určuje rozsah a osy pohybu. Kulové klouby mají tři stupně volnosti, pantové jeden, sedlové dva. Znalost je důležitá pro volbu masážní techniky a mobilizace.",
    sourceRef: `${NSK_ANATOMIE} § 2.1 Kostra`,
  },
  {
    topicSlug: "anatomie",
    kind: "open",
    stemCs: "Popište dráhu malého (plicního) krevního oběhu od pravé komory po levou síň.",
    correctAnswer: "Pravá komora → plicnice (truncus pulmonalis) → pravá a levá plicní tepna → plicní kapiláry v alveolech (výměna plynů) → plicní žíly → levá síň.",
    explanationCs: "Malý oběh slouží k okysličení krve. Znalost je důležitá pro pochopení kontraindikací u plicní hypertenze a edému plic.",
    sourceRef: `${NSK_ANATOMIE} § 2.3-2.4 Dýchací a oběhová soustava`,
  },
  {
    topicSlug: "anatomie",
    kind: "open",
    stemCs: "Vysvětlete pojmy „origo“ a „insertio“ u kosterního svalu a uveďte, proč je toto rozlišení důležité pro maséra.",
    correctAnswer: "Origo je pevnější, obvykle proximální začátek svalu na méně pohyblivé kosti. Insertio je distální úpon na pohyblivější kosti, která se při kontrakci přibližuje k origu. Pro maséra je rozlišení důležité proto, aby věděl směr průběhu svalových vláken, funkci svalu (jaký pohyb vyvolává), a tím volil směr a techniku hnětení po průběhu svalu od origa k insertiu.",
    explanationCs: "Bez znalosti origa a insertia nelze správně nahmatat svalové bříško ani určit, který pohyb sval vyvolává (důležité např. při triggerpoint terapii).",
    sourceRef: `${NSK_ANATOMIE} § 2.2 Svalová soustava`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "mc",
    stemCs: "Mezi absolutní (celkové) kontraindikace masáže patří:",
    choices: ["Mírná únava po cvičení", "Akutní horečnaté onemocnění", "Svalová ztuhlost druhý den po tréninku", "Suchá pokožka v zimě"],
    correctAnswer: "Akutní horečnaté onemocnění",
    explanationCs: "Horečka nad 37,5 °C a akutní infekce jsou absolutní kontraindikací – masáž by zatížila oběh, rozšířila infekci a zhoršila stav. Po odeznění a 48 h bez teploty lze masírovat.",
    sourceRef: `${NSK_KONTRA}`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "mc",
    stemCs: "V oblasti akutního zánětu nebo lokální infekce masér:",
    choices: ["Masíruje s vyšším tlakem pro prokrvení", "Oblasti se musí zcela vyhnout", "Masíruje pouze jemnou effleurage", "Aplikuje teplo a poté masáž"],
    correctAnswer: "Oblasti se musí zcela vyhnout",
    explanationCs: "Masáž akutně zanícené či infikované tkáně hrozí šířením zánětu nebo infekce (lymfou a krevním řečištěm) a zhoršením stavu. Oblast se vynechává; klient jde k lékaři.",
    sourceRef: `${NSK_KONTRA}`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "mc",
    stemCs: "Svrchní vrstvu kůže (epidermis) tvoří především:",
    choices: ["Tukové buňky (adipocyty)", "Svalová vlákna", "Dlaždicový epitel s keratinocyty", "Pouze nervová zakončení"],
    correctAnswer: "Dlaždicový epitel s keratinocyty",
    explanationCs: "Epidermis je mnohovrstevnatý dlaždicový rohovatějící epitel. Hlavní buněčný typ jsou keratinocyty; dále melanocyty, Langerhansovy a Merkelovy buňky.",
    sourceRef: `${NSK_KONTRA} § Kůže`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "mc",
    stemCs: "Podezření na hlubokou žilní trombózu (DVT) v dolní končetině znamená:",
    choices: ["Indikaci k hluboké masáži lýtka pro rozpuštění trombu", "Absolutní kontraindikaci masáže končetiny a akutní doporučení lékařského vyšetření", "Masáž pouze ve směru od srdce", "Zvýšený tlak na bérec"],
    correctAnswer: "Absolutní kontraindikaci masáže končetiny a akutní doporučení lékařského vyšetření",
    explanationCs: "Masáž při DVT může uvolnit trombus a způsobit plicní embolii – život ohrožující stav. Příznaky: jednostranný otok, bolest lýtka, teplo, zarudnutí. Klient k lékaři.",
    sourceRef: `${NSK_KONTRA}`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "mc",
    stemCs: "Mezi infekční kožní onemocnění, která vylučují masáž dané oblasti, patří:",
    choices: ["Suchá kůže", "Stará jizva z dětství", "Plísňová infekce (tinea, mykóza)", "Vrozené pigmentové znaménko"],
    correctAnswer: "Plísňová infekce (tinea, mykóza)",
    explanationCs: "Plísňové, bakteriální i virové kožní infekce se masáží přenášejí na maséra i na další části těla klienta. Oblast se vynechává a doporučuje se dermatologické ošetření.",
    sourceRef: `${NSK_KONTRA}`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "open",
    stemCs: "Uveďte pět (5) stavů, při kterých masáž NESMÍ být provedena (absolutní kontraindikace), a ke každému stručně odůvodněte.",
    correctAnswer: "Příklady (stačí jakýchkoliv 5): 1) Horečka / akutní infekce – riziko zhoršení stavu a přenosu. 2) Hluboká žilní trombóza – riziko embolie. 3) Akutní úraz, zlomenina, čerstvá operace – riziko krvácení a zhoršení hojení. 4) Otevřené rány, ekzém v akutní fázi, infekční kožní choroby – riziko kontaminace. 5) Neléčené nádorové onemocnění – možné šíření. 6) Těžká nekompenzovaná hypertenze nebo srdeční nedostatečnost – oběhové zhoršení. 7) Silná intoxikace (alkohol, drogy) – nespolupracující klient. 8) Krvácivé stavy / antikoagulační léčba v toxické dávce – riziko hematomů.",
    explanationCs: "Seznam absolutních kontraindikací je podmnožinou standardu. Relativní kontraindikace (těhotenství, diabetes, hypertenze kompenzovaná) vyžadují souhlas lékaře a úpravu techniky.",
    sourceRef: `${NSK_KONTRA}; ${CURRICULUM}`,
  },
  {
    topicSlug: "kontraindikace-a-kuze",
    kind: "open",
    stemCs: "Proč jsou křečové žíly (varixy) lokální kontraindikací? Popište, jak postupovat při masáži klienta, který má varixy pouze na bércích.",
    correctAnswer: "Varixy jsou rozšířené, chronicky poškozené povrchové žíly s nedomykavými chlopněmi; tlak na ně může poškodit křehkou cévní stěnu, způsobit hematom nebo odtržení trombu z povrchového systému. Postup: postiženému úseku (konkrétní varixy) se masér zcela vyhne, na okolí (stehno, chodidlo) použije pouze jemné tahy ve směru žilního návratu (distálně → proximálně) a zcela vynechá hnětení, tapotement a kompresi na bércích s varixy. Klienta upozorní na ošetření žil flebologem.",
    explanationCs: "Rozlišujeme lokální kontraindikaci (masáž vynechá pouze daný úsek) a celkovou (masáž se neprovádí vůbec). Varixy jsou typicky lokální; pokud jsou rozsáhlé nebo doprovází chronickou žilní insuficienci s otokem, masáž odmítáme zcela a odesíláme k lékaři.",
    sourceRef: `${NSK_KONTRA}`,
  },
];

async function main() {
  for (const t of topics) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { nameCs: t.nameCs, weight: t.weight },
      create: t,
    });
  }

  const topicRecords = await prisma.topic.findMany({
    where: { slug: { in: topics.map((t) => t.slug) } },
  });
  const topicIdBySlug: Record<string, string> = Object.fromEntries(
    topicRecords.map((t) => [t.slug, t.id]),
  );

  await prisma.question.deleteMany({
    where: { topicId: { in: Object.values(topicIdBySlug) } },
  });

  for (const q of questions) {
    await prisma.question.create({
      data: {
        topicId: topicIdBySlug[q.topicSlug],
        kind: q.kind,
        stemCs: q.stemCs,
        choices: q.choices ? JSON.stringify(q.choices) : null,
        correctAnswer: q.correctAnswer,
        explanationCs: q.explanationCs,
        sourceRef: q.sourceRef,
      },
    });
  }

  const counts = await prisma.question.groupBy({
    by: ["topicId"],
    _count: { _all: true },
  });
  const nameById = Object.fromEntries(topicRecords.map((t) => [t.id, t.nameCs]));
  for (const c of counts) {
    console.log(`${nameById[c.topicId]}: ${c._count._all} questions`);
  }
  console.log(`Total seeded: ${questions.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
