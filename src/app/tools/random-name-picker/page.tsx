import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import RandomNamePickerTool from "@/components/random-name-picker-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Random Name Picker – Pick Winner from List Free Online",
  description:
    "Randomly pick one or more names from a list for raffles, giveaways, classrooms, and team selection. Free, fair, animated draw with pick history. No signup.",
  keywords: [
    "random name picker online free",
    "pick random winner from list",
    "raffle winner picker free",
    "random name selector online",
    "giveaway winner picker free",
    "classroom name picker online",
    "random draw tool free",
    "name picker wheel free online",
  ],
  alternates: { canonical: "/tools/random-name-picker" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Random Name Picker – Pick Winner from List Free Online | ToolMint",
    description:
      "Enter a list of names, choose how many winners to pick, allow duplicates if needed, and track recent picks in your browser.",
    url: "/tools/random-name-picker",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Name List Input", desc: "Paste or type one name per line into the textarea and the tool automatically counts how many valid names are loaded." },
  { title: "Pick Count Selector", desc: "Choose exactly how many names to draw so you can use the same tool for a single winner, multiple winners, or group assignments." },
  { title: "Duplicate Mode", desc: "Allow duplicates when you want names to be eligible for reselection, or turn duplicates off for fair one-time winner draws." },
  { title: "Animated Results & History", desc: "Watch a short spinning animation during each draw, then review the selected names and the recent pick history for up to 20 rounds." },
];

const useCases = [
  { title: "Giveaways & Contests", desc: "Pick a fair winner from a list of entrants. Turn duplicates off for a one-per-person raffle, or on if some participants entered multiple times." },
  { title: "Classrooms & Teams", desc: "Teachers can randomly call on students to answer questions, or fairly assign students to project groups without perceived favoritism." },
  { title: "Decision Making", desc: "Can't decide who goes first, who pays, or which task to tackle next? Paste your options and let the randomizer decide without debate." },
];

const steps = [
  { title: "Enter names", desc: "Add one name per line in the input box. The counter updates automatically as you add or remove entries." },
  { title: "Choose how many to pick", desc: "Set the number of winners or selected names you want the tool to draw from the list." },
  { title: "Set duplicate mode", desc: "Turn Allow duplicates on if names can be selected more than once, or leave it off for a non-repeating draw." },
  { title: "Run the picker", desc: "Start the draw to see the animated selection, then view the chosen names and recent history below." },
];

const faqs = [
  {
    q: "Can this random name picker choose more than one winner?",
    a: "Yes. ToolMint's Random Name Picker lets you choose how many names to draw, so you can pick one winner or multiple winners from the same list.",
  },
  {
    q: "What happens when Allow duplicates is turned off?",
    a: "When duplicates are disabled, the tool uses a shuffle-based selection so the same name is not picked twice in the same draw. That makes it suitable for fair raffles, classroom selection, and team assignment.",
  },
  {
    q: "Does the picker keep a history of previous draws?",
    a: "Yes. The tool stores a recent history of past rounds so you can review prior selections. It keeps up to 20 rounds of pick history in the interface.",
  },
  {
    q: "Is the selection random?",
    a: "Yes. For non-duplicate draws, the tool uses Fisher-Yates style shuffling to randomize the list before selecting results. In duplicate mode, it chooses names randomly from the available entries.",
  },
  {
    q: "What can I use this random picker for?",
    a: "It works well for raffle winners, giveaway draws, classroom participation, secret selections, meeting facilitators, team assignments, and any situation where you need a fast random choice from a list of names.",
  },
];

export default function RandomNamePickerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <WebAppSchema slug="random-name-picker" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Random Name Picker" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Random Name Picker – Pick Winners, Teams &amp; Classroom Names
        </h1>

        <ProcessingBadge slug="random-name-picker" />
        <ToolAnalytics slug="random-name-picker" category="more" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Enter a list of names and randomly pick one or more winners instantly. Built for raffles,
          giveaways, classroom picks, and team selection, with duplicate mode, animated draws, and recent
          pick history. No signup required.
        </p>

        <div className="mt-8">
          <RandomNamePickerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Random Picker Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Who Uses a Random Name Picker
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Use the Random Name Picker
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Fairness Matters in Random Draws – and How to Achieve It
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A common mistake with manual random selection is using methods that appear random but have
              hidden biases. Drawing from a hat seems fair but the order in which names were placed affects
              the odds if the hat isn&apos;t shaken properly — names put in first tend to clump at the bottom and
              get drawn less often. Spreadsheet RAND() functions can produce repeated picks if the formula
              recalculates, and basic random number generators like JavaScript&apos;s Math.random() — while
              statistically decent for most purposes — are not cryptographically random and could in theory
              be predicted. This picker uses Fisher-Yates shuffling (a mathematically proven unbiased
              algorithm) on the full name list before selecting the required number of winners. Each shuffle
              decision uses the browser&apos;s available randomness rather than a predictable formula, ensuring
              that every possible ordering of names is equally likely. The result is a draw that meets the
              standard of statistical fairness that would hold up to scrutiny in a public contest or official
              school selection.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Duplicates On vs Off – When to Use Each Mode
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The duplicate mode setting changes the fundamental behavior of the picker. With duplicates
              off (the default), each name can only be selected once per draw — useful for raffles where
              each entry gets exactly one shot, classroom random calling where you want to make sure everyone
              gets a turn before anyone is called twice, or team selection where each person goes to exactly
              one team. With duplicates on, the picker treats each draw as independent — the same name can
              be selected multiple times in the same draw. This is useful when you are picking from a
              weighted list (someone entered a contest 5 times and appears 5 times in the list), running
              probability simulations, or playing a quick decision game where the same option can legitimately
              come up more than once. The pick history tracks every round separately so even with duplicates
              off you can run multiple rounds of a contest — the history shows what was picked in each prior
              round so you can track who has already been selected across sessions.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="random-name-picker" />
      </main>
    </>
  );
}
